import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { generalConfig } from './configs';
import { VaultModule } from './modules/vault/vault.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      load: [generalConfig],
      isGlobal: true
    }),
    VaultModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
