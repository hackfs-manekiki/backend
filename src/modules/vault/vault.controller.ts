import { Controller, Get, Param } from "@nestjs/common";
import { VaultService } from "./vault.service";

@Controller('vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Get('vault/:address')
    async getVault(@Param('address') address: string): Promise<any> {
        return await this.vaultService.getVault(address)
    }

    @Get('request/:address')
    async getRequests(@Param('address') address: string): Promise<any> {
        return await this.vaultService.getRequest(address)
    }

    @Get('request/:address/pending')
    async getPendingRequests(@Param('address') address: string): Promise<any> {
        const requests = await this.vaultService.getRequest(address)
        return requests.filter(req => req.status == 'PENDING')
    }
}