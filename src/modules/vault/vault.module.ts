import { HttpModule, HttpService } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CovalentService } from './covalent.service'
import { GraphService } from './graph.service'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'

@Module({
    imports: [HttpModule],
    controllers: [VaultController],
    providers: [VaultService, GraphService, CovalentService],
})
export class VaultModule { }
