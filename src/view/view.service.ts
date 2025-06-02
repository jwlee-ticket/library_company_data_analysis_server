import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

@Injectable()
export class ViewService {
  private readonly logger = new Logger(ViewService.name);
  constructor(private dataSource: DataSource) { }


  async exportAllViewDefinitions(): Promise<void> {
    try {
      // PostgreSQL에서 모든 View 정의 추출 쿼리
      const query = `
    SELECT 
      schemaname, 
      viewname, 
      definition 
    FROM 
      pg_views 
    WHERE 
      schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY 
      schemaname, viewname;
  `;

      const views = await this.dataSource.query(query);

      let exportContent = '';

      for (const view of views) {
        exportContent += `-- View: ${view.schemaname}.${view.viewname}\n`;
        exportContent += `-- Drop view if exists\nDROP VIEW IF EXISTS ${view.schemaname}.${view.viewname};\n\n`;
        exportContent += `-- Create view\nCREATE OR REPLACE VIEW ${view.schemaname}.${view.viewname} AS\n${view.definition}\n\n`;
      }

      // 파일로 저장
      const filePath = path.join(process.cwd(), 'view-definitions.sql');
      fs.writeFileSync(filePath, exportContent);

      this.logger.log(`View definitions exported to ${filePath}`);
    } catch (error) {
      this.logger.error(`Error exporting view definitions: ${error.message}`);
      throw error;
    }
  }
}
