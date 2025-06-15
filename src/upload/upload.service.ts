import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadModel } from './entities/file-upload.entity';
import { PlayService } from 'src/play/play.service';
import { PlayTicketSaleModel } from 'src/play/entities/play-ticket-sale.entity';
import { PlayShowSaleModel } from 'src/play/entities/play-show-sale.entity';
import { LiveModel } from 'src/live/entities/live.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConcertTicketSaleModel } from 'src/concert/entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from 'src/concert/entities/concert-seat-sale.entity';
import { ConcertService } from 'src/concert/concert.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(FileUploadModel)
    private readonly uploadRepository: Repository<FileUploadModel>,
    @InjectRepository(PlayTicketSaleModel)
    private readonly playDailySaleRepository: Repository<PlayTicketSaleModel>,
    @InjectRepository(PlayShowSaleModel)
    private readonly playTurnSaleRepository: Repository<PlayShowSaleModel>,
    @InjectRepository(LiveModel)
    private readonly liveRepository: Repository<LiveModel>,
    @InjectRepository(ConcertTicketSaleModel)
    private readonly concertTicketSaleRepository: Repository<ConcertTicketSaleModel>,
    @InjectRepository(ConcertSeatSaleModel)
    private readonly concertSeatSaleRepository: Repository<ConcertSeatSaleModel>,
    private readonly playService: PlayService,
    private readonly concertService: ConcertService,
  ) { }

  async handlePlayExcel(file, liveName: string, userName: string) {
    try {

      const liveInfo = await this.liveRepository.findOne({ where: { liveName } });

      // 엑셀 파일을 읽어옵니다.
      const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const fileDate = fileName.split('_')[0];
      let targetDate: Date;

      if (fileDate.startsWith('20') === false) {
        const fixFileDate = '20' + fileDate;
        const formattedFileDate = fixFileDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        targetDate = Date.parse(formattedFileDate) ? new Date(formattedFileDate) : null;
      } else {
        const formattedFileDate = fileDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        targetDate = Date.parse(formattedFileDate) ? new Date(formattedFileDate) : null;
      }

      targetDate.setHours(0);
      targetDate.setMinutes(0);
      targetDate.setSeconds(0);
      targetDate.setMilliseconds(0);


      const liveId = fileName.split('_')[1];

      this.logger.debug(`liveInfo.liveId: ${liveInfo.liveId}`);
      this.logger.debug(`liveId: ${liveId}`);
      if (liveInfo.liveId !== liveId) {
        this.logger.error(`liveInfo.liveId !== liveId: ${liveId}`);
        return {
          status: false,
          message: '파일명과 공연 ID가 일치하지 않습니다.',
        };
      }

      this.logger.debug(`targetDate: ${targetDate}`);

      const live = await this.liveRepository.findOne({ where: { liveId } });

      if (!live) {
        return {
          status: false,
          message: '해당하는 공연 정보가 없습니다.',
        };
      }

      if (live.category === '콘서트') {
        const oldUpload = await this.uploadRepository.findOne({ where: { live: { liveId: liveId }, recordDate: targetDate }, relations: ['live', 'concertSaleData', 'concertSeatSaleData'] });

        if (oldUpload) {
          await this.deleteFile(oldUpload.id);
          await this.concertTicketSaleRepository.remove(oldUpload.concertSaleData);
          await this.concertSeatSaleRepository.remove(oldUpload.concertSeatSaleData);
          await this.uploadRepository.softRemove(oldUpload);
        }

      } else {
        const oldUpload = await this.uploadRepository.findOne({ where: { live: { liveId: liveId }, recordDate: targetDate }, relations: ['live', 'dailySaleData', 'showSaleData'] });

        if (oldUpload) {
          await this.deleteFile(oldUpload.id);
          await this.playDailySaleRepository.remove(oldUpload.dailySaleData);
          await this.playTurnSaleRepository.remove(oldUpload.showSaleData);
          await this.uploadRepository.softRemove(oldUpload);
        }

      }




      const newUpload = this.uploadRepository.create({
        fileName,
        recordDate: targetDate,
        uploadBy: userName,
        live,
      });

      const saveUpload = await this.uploadRepository.save(newUpload);

      const saveFile = await this.saveFile(file, saveUpload.id);

      if (saveFile.status === true) {
        await this.uploadRepository.update({ id: saveUpload.id }, { isSavedFile: true });
      }

      const latestRecordDate = live.latestRecordDate;
      this.logger.debug('latestRecordDate', latestRecordDate);
      this.logger.debug('targetDate', targetDate);

      if (latestRecordDate === null) {
        live.latestRecordDate = targetDate;
        await this.liveRepository.save(live);
      }
      else {
        const latestDate = new Date(latestRecordDate);

        if (latestDate.getTime() < targetDate.getTime()) {
          live.latestRecordDate = targetDate;
          await this.liveRepository.save(live);
        }
      }

      this.logger.debug(`saveUpload: ${JSON.stringify(saveUpload.id)}`);


      if (live.category === '콘서트') {

        const saveConcertData = await this.concertService.uploadExcelData(file, saveUpload);

        if (saveConcertData.status === true) {
          this.logger.debug(`saveFileData: ${JSON.stringify(saveConcertData)}`);

          /// 파일 업로드 하고, 업로드 경로를 저장하는 로직 추가

          return saveConcertData;
        } else {
          this.logger.error(`saveFileData: ${JSON.stringify(saveConcertData)}`);
          await this.uploadRepository.delete({ id: saveUpload.id });
          return saveConcertData;
        }

      } else {
        const savePlayData = await this.playService.uploadExcelData(file, saveUpload);

        if (savePlayData.status === true) {
          this.logger.debug(`saveFileData: ${JSON.stringify(savePlayData)}`);

          /// 파일 업로드 하고, 업로드 경로를 저장하는 로직 추가

          return savePlayData;
        } else {
          this.logger.error(`saveFileData: ${JSON.stringify(savePlayData)}`);
          await this.uploadRepository.delete({ id: saveUpload.id });
          return savePlayData;
        }
      }


    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: '파일 업로드에 실패했습니다.\n파일명 등 양식을 확인하세요.',
      };
    }
  }

  async saveFile(file: Express.Multer.File, uploadId: number) {
    try {
      // 파일 저장 경로 설정
      const uploadDir = path.join(process.cwd(), 'uploads');

      // 디렉토리가 없으면 생성
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 파일명 생성 (liveName과 타임스탬프를 사용하여 고유한 파일명 생성)      
      const fileName = `${uploadId}.xlsx`;
      const filePath = path.join(uploadDir, fileName);

      // 파일 저장
      fs.writeFileSync(filePath, file.buffer);

      this.logger.log(`Excel file saved: ${filePath}`);

      return {
        status: true,
        message: 'Excel file uploaded successfully',
        fileName: fileName,
        filePath: filePath
      };
    } catch (error) {
      this.logger.error(`Failed to handle excel file: ${error.message}`, error.stack);
    }
  }

  async getFileForDownload(uploadId: number) {
    try {
      // 업로드 데이터 조회
      const uploadData = await this.uploadRepository.findOne({
        where: { id: uploadId }
      });

      if (!uploadData) {
        this.logger.error(`Upload data not found for ID: ${uploadId}`);
        throw new NotFoundException('Upload data not found');
      }

      // 파일 경로 생성
      const filePath = path.join(process.cwd(), 'uploads', `${uploadId}.xlsx`);

      // 파일 존재 여부 확인
      if (!fs.existsSync(filePath)) {
        this.logger.error(`File not found at path: ${filePath}`);
        throw new NotFoundException('Excel file not found');
      }

      return {
        filePath: filePath,
        originalFileName: uploadData.fileName // 원래 파일명 반환
      };

    } catch (error) {
      this.logger.error(`Error getting file for download: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(uploadId: number) {
    try {
      const oldFilePath = path.join(process.cwd(), 'uploads', `${uploadId}.xlsx`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        this.logger.debug(`Deleted old Excel file: ${oldFilePath}`);
      }
    } catch (fileError) {
      this.logger.error(`Failed to delete old file: ${fileError.message}`, fileError.stack);
    }
  }

  async getLiveInfo(id: string) {
    try {

      /// 나중에 권한에 따라서 live 정보가 보이도록 설정

      const liveInfo = await this.liveRepository.find({ where: { isLive: true } });
      const liveNames = liveInfo.map((live) => live.liveName);

      this.logger.debug(`getLiveInfo: ${JSON.stringify(liveNames)}`);

      return liveNames;

    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUploadEntry(liveName: string) {
    try {

      this.logger.debug(`getUploadEntry: ${liveName}`);

      // 데이터 조회
      const fileUpload = await this.uploadRepository.find({
        where: { live: { liveName } },
        select: ['id', 'fileName', 'recordDate', 'uploadBy', 'uploadDate', 'isSavedFile', 'deleteDate'],
        withDeleted: true,
      });

      // 'deleteDate'가 null인 경우는 활성화된 데이터, 그렇지 않은 경우는 삭제된 데이터로 구분
      const activeUploads = fileUpload.filter(item => item.deleteDate === null);
      const deletedUploads = fileUpload.filter(item => item.deleteDate !== null);

      // 날짜 순서대로 정렬 (내림차순)
      activeUploads.sort((a, b) => a.recordDate > b.recordDate ? -1 : a.recordDate < b.recordDate ? 1 : 0);
      deletedUploads.sort((a, b) => a.recordDate > b.recordDate ? -1 : a.recordDate < b.recordDate ? 1 : 0);

      // 반환 (활성화된 항목과 삭제된 항목 구분)
      return { activeUploads, deletedUploads };

    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUploadHistory() {
    try {
      const limit = 10; // 페이지당 항목 수

      let uploadHistory = [];

      // 라이브 공연 정보 조회 - 관계 설정 수정
      const liveInfo = await this.liveRepository.find({
        where: { isLive: true },
        relations: ['uploadFile', 'uploadFile.dailySaleData'] // 단순히 uploadFile 관계만 가져옵니다
      });

      // 데이터 매핑하여 원하는 형식으로 변환
      uploadHistory = liveInfo.map((item) => {
        // uploadFile이 존재하고 배열에 요소가 있는지 확인
        if (item.uploadFile && item.uploadFile.length > 0) {

          // const uploadFile = item.uploadFile.find((upload) => {

          //   const latestRecordDate = new Date(item.latestRecordDate);
          //   const uploadRecordDate = new Date(upload.recordDate);

          //   if (latestRecordDate && latestRecordDate.getTime() === uploadRecordDate.getTime()) {
          //     return upload;
          //   }
          // });

          // if (uploadFile.dailySaleData && uploadFile.dailySaleData.length > 0) {
          //   uploadFile.dailySaleData.sort((a, b) => a.salesDate > b.salesDate ? -1 : a.salesDate < b.salesDate ? 1 : 0);
          // }

          const uploadDate = new Date(item.latestRecordDate); // 업로드 날짜 접근

          // 요일 구하기 (한국어로)
          const days = ['일', '월', '화', '수', '목', '금', '토'];
          const dayOfWeek = days[uploadDate.getDay()];

          return {
            liveName: item.liveName || '', // live 객체가 없을 경우 빈 문자열 반환
            uploadDate: uploadDate.toISOString(), // ISO 형식으로 날짜 반환
            dayOfWeek: dayOfWeek // 요일 반환
          };
        } else {
          // uploadFile이 없는 경우 기본값 반환
          return {
            liveName: item.liveName || '',
            uploadDate: null,
            dayOfWeek: null,
          };
        }
      });

      uploadHistory.sort((a, b) => a.uploadDate > b.uploadDate ? -1 : a.uploadDate < b.uploadDate ? 1 : 0); // 업로드 날짜 기준으로 정렬

      // 반환
      return { uploadHistory };

    } catch (error) {
      this.logger.error(error);
      throw error; // 에러를 던져서 상위 계층에서 처리할 수 있게 함
    }
  }

  async timeTest() {
    try {
      const data = await this.uploadRepository.find();
      // 반환
      return { data };

    } catch (error) {
      this.logger.error(error);
      throw error; // 에러를 던져서 상위 계층에서 처리할 수 있게 함
    }
  }

  async deleteEntry(liveName: string, uploadId: number) {
    try {

      const live = await this.liveRepository.findOne({ where: { liveName }, relations: ['uploadFile'] });

      if (!live) {
        return {
          status: false,
          message: '해당하는 공연 정보가 없습니다.',
        };
      }

      if (live.category === '콘서트') {
        const concertUpload = await this.uploadRepository.findOne({ where: { id: uploadId }, relations: ['live', 'concertSaleData', 'concertSeatSaleData'] });
        if (concertUpload) {
          await this.deleteFile(concertUpload.id);
          await this.concertTicketSaleRepository.remove(concertUpload.concertSaleData);
          await this.concertSeatSaleRepository.remove(concertUpload.concertSeatSaleData);
          await this.uploadRepository.remove(concertUpload);
        }
      } else {
        const upload = await this.uploadRepository.findOne({ where: { id: uploadId }, relations: ['live', 'dailySaleData', 'showSaleData'] });
        if (upload) {
          await this.deleteFile(upload.id);
          await this.playDailySaleRepository.remove(upload.dailySaleData);
          await this.playTurnSaleRepository.remove(upload.showSaleData);
          await this.uploadRepository.remove(upload);
        }
      }

      const receckLive = await this.liveRepository.findOne({ where: { liveName }, relations: ['uploadFile'] });


      if (receckLive.uploadFile.length === 0) {
        receckLive.latestRecordDate = null;
        await this.liveRepository.save(receckLive);
      } else {
        const latestUploadRecordDate = receckLive.uploadFile.sort((a, b) => a.recordDate > b.recordDate ? -1 : a.recordDate < b.recordDate ? 1 : 0)[0].recordDate;

        if (receckLive.latestRecordDate !== latestUploadRecordDate) {
          receckLive.latestRecordDate = latestUploadRecordDate;
          await this.liveRepository.save(receckLive);
        }
      }

      return {
        code: 200,
        status: true,
        message: '해당하는 공연 정보가 삭제되었습니다.',
      };

    } catch (error) {
      this.logger.error(error);
      return {
        code: 400,
        status: false,
        message: '해당하는 공연 정보가 삭제되지 않았습니다.',
      };
    }
  }

}