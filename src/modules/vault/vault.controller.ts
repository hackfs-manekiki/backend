import { Controller, Get, Param } from "@nestjs/common";
import { VaultService } from "./vault.service";
import { Role } from '../../interfaces/vault'

@Controller('vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Get('vault/:address')
    async getVault(@Param('address') address: string): Promise<any> {
        return await this.vaultService.getVault(address)
    }

    @Get('role/:address')
    async getRole(@Param('address') address: string): Promise<Role> {
        return await this.vaultService.getRole(address)
    }

    @Get('role/:address/:vault')
    async getRoleInVault(@Param('address') address: string,
        @Param('vault') vault: string): Promise<string> {
        const roles = await this.vaultService.getRole(address)
        if (roles.owner.includes(vault)) {
            return 'owner'
        }
        if (roles.admins.includes(vault)) {
            return 'admin'
        }
        if (roles.approvers.includes(vault)) {
            return 'approver'
        }
        if (roles.members.includes(vault)) {
            return 'member'
        }
        return ''
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