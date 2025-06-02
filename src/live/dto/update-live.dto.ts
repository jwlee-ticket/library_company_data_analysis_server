import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveDto } from './create-live.dto';

export class UpdateLiveDto {
    perLiveId: string;
    liveId: string;
    liveName: string;
    category: string;
    isLive: boolean;
    location: string;
    slackWebhookUrl: string;
    showStartDate: Date;
    showEndDate: Date;
    saleStartDate: Date;
    saleEndDate: Date;
    runningTime: number;
    targetShare: number;
    bep: number;
    previewEndingDate: Date;
    showTotalSeatNumber: number;
    concertDateTime?: Date | null
    concertSeatNumberR?: number | null
    concertSeatNumberS?: number | null
    concertSeatNumberA?: number | null
    concertSeatNumberB?: number | null
    concertSeatNumberVip?: number | null
}
