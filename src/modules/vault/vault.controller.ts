import { Controller, Get, Param } from "@nestjs/common";
import { VaultService } from "./vault.service";

@Controller('vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Get(':address')
    async getVault(@Param('address') address: string): Promise<any> {
        return this.vaultService.getVault(address)
    }
}