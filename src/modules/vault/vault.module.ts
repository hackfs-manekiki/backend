import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphService } from './graph.service'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'

@Module({
    imports: [],
    controllers: [VaultController],
    providers: [VaultService, GraphService],
})
export class VaultModule { }
