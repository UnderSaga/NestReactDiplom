import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle("Back API")
    .setDescription("Описание всех апишек бэка")
    .setVersion("1.0")
    .addTag("User")
    .addTag("Post")
    .addTag("Comment")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("swagger", app, document)

  await app.listen(5000)
}
bootstrap()
