import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('LibraryCompany Data Analysis API')
    .setDescription('LibraryCompany 데이터 분석 서버 API')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE', // 허용할 HTTP 메서드
    allowedHeaders: 'Content-Type, Authorization', // 허용할 HTTP 헤더
  });

  await app.listen(3001);
}
bootstrap();
