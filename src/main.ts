import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Явно указываем разрешённый origin
    credentials: true, // Разрешаем отправку cookies, авторизационных заголовков
  });

  const config = new DocumentBuilder()
    .setTitle('Bitrix24')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('bitrix')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);
  app.listen(4000);
}
bootstrap();
