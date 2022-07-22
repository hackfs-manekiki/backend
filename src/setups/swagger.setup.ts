import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication) => {

    const documentConfig = new DocumentBuilder()
        .setTitle('Manekiki Vault')
        .setVersion('0.1')
        .build()
    const document = SwaggerModule.createDocument(app, documentConfig)
    SwaggerModule.setup('doc', app, document)
}
