import { Injectable } from '@nestjs/common';
import { Vault, Member } from 'src/interfaces/vault';
import { Request } from 'src/interfaces/request';
import { GraphService } from './graph.service';
import * as VaultArtifact from '../../../abis/Vault.json'
import * as TokenArtifact from '../../../abis/IERC20.json'
import { ethers } from 'ethers';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService {

    vaultInterface: ethers.utils.Interface
    tokenInterface: ethers.utils.Interface
    provider: ethers.providers.BaseProvider

    constructor(
        private readonly configService: ConfigService,
        private readonly graphService: GraphService
    ) {
        const uri = this.configService.get<string>('eth.uri')
        this.provider = ethers.providers.getDefaultProvider(uri)
        this.vaultInterface = new ethers.utils.Interface(VaultArtifact.abi)
        this.tokenInterface = new ethers.utils.Interface(TokenArtifact.abi)
    }

    async getVault(address: string) {
        let vaultSet: Set<string> = new Set<string>()
        const queryOwner = `query {
            vaults(
                where: {
                    owner: "${address}"
                }
            ) {
              id
              name
            }
          }`
        const queryAdmin = `query {
            admins(
                where: {
                    address: "${address}"
                }
            ) {
              vault {
                id
                name
              }
            }
          }`
        const queryApprover = `query {
            approvers(
                where: {
                    address: "${address}"
                }
            ) {
              vault {
                id
                name
              }
            }
          }`
        const queryMember = `query {
            members(
                where: {
                    address: "${address}"
                }
            ) {
              vault {
                id
                name
              }
            }
          }`
        try {
            const ownerResult = await this.graphService.query(queryOwner)
            ownerResult.data.vaults.forEach(v => {
                vaultSet.add(`${v.id}`)
            })
            const adminResult = await this.graphService.query(queryAdmin)
            adminResult.data.admins.forEach(v => {
                vaultSet.add(`${v.vault.id}`)
            })
            const approverResult = await this.graphService.query(queryApprover)
            approverResult.data.approvers.forEach(v => {
                vaultSet.add(`${v.vault.id}`)
            })
            const memberResult = await this.graphService.query(queryMember)
            memberResult.data.members.forEach(v => {
                vaultSet.add(`${v.vault.id}`)
            })
            // get all vault
            let vaults: Vault[] = []
            await Promise.all([...vaultSet].map(async (v) => {
                const queryVault = `query {
                    vault(
                        id: "${v}"
                    ) {
                        id
                        name
                        owner
                      admins {
                            address
                            name
                        }
                      approvers {
                            address
                            name
                            budget
                        }
                      members {
                            address
                            name
                        }
                    }
                }`
                const vaultResult = await this.graphService.query(queryVault)
                const admins = vaultResult.data.vault.admins.map(a => {
                    return {
                        address: a.address,
                        name: a.name
                    }
                })
                const approvers = vaultResult.data.vault.approvers.map(ap => {
                    return {
                        address: ap.address,
                        name: ap.name,
                        budget: ap.budget
                    }
                })
                const members = vaultResult.data.vault.members.map(m => {
                    return {
                        address: m.address,
                        name: m.name
                    }
                })
                vaults.push({
                    address: vaultResult.data.vault.id,
                    name: vaultResult.data.vault.name,
                    owner: vaultResult.data.vault.owner,
                    admins,
                    approvers,
                    members
                })
            }))
            return vaults
        } catch (err) {
            console.log(err)
        }
    }

    getAllMember(vaults: Vault[]): Record<string, Member> {
        let memberMap: Record<string, Member> = {}
        vaults.forEach(v => {
            if (!memberMap[v.owner]) {
                memberMap[v.owner] = {
                    address: v.owner,
                    name: ''
                }
            }
            v.admins.forEach(a => {
                const address = ethers.utils.getAddress(a.address)
                if (!memberMap[address]) {
                    memberMap[address] = a
                }
            })
            v.approvers.forEach(a => {
                const address = ethers.utils.getAddress(a.address)
                if (!memberMap[address]) {
                    memberMap[address] = {
                        address: address,
                        name: a.name
                    }
                }
            })
            v.members.forEach(a => {
                const address = ethers.utils.getAddress(a.address)
                if (!memberMap[address]) {
                    memberMap[address] = a
                }
            })
        })
        return memberMap
    }

    async getRequest(address: string) {
        const vaults = await this.getVault(address)
        const members = this.getAllMember(vaults)
        // mapping name
        // get request per vault
        let requests: Request[] = []
        let rawRequests: any[] = []
        await Promise.all(vaults.map(async (vault) => {
            try {
                const requestQuery = `query {
                    requests(
                        where: {
                            vault: "${vault.address}"
                        }
                    ) {
                        requestId
                        requester
                        executor
                        isExecuted
                        value
                        budget
                        input
                        createdTxhash
                        createdTimestamp
                        executedTxhash
                        executedTimestamp
                    }
                }`
                const result = await this.graphService.query(requestQuery)
                rawRequests = [...rawRequests, ...result.data.requests]
            } catch (err) {
                console.log(err)
            }
        }))
        await Promise.all(rawRequests.map(async (req) => {
            const input = req.input
            const data: any = this.vaultInterface.decodeFunctionData('requestApproval', input)
            let approverAddress, approverName, approveTxhash, approveTimestamp = null
            let status = 'PENDING'
            if (req.isExecuted) {
                status = 'APPROVED'
                approverAddress = ethers.utils.getAddress(req.executor)
                approverName = members[approverAddress]?.name || null
                approveTxhash = req.executedTxhash
                approveTimestamp = dayjs.unix(req.executedTimestamp).toDate()
            }
            let denom, rawAmount, amount, recipientAddress, recipientName, tokenAddress
            if (data.request.requestType == 0) {
                // eth transfer
                recipientAddress = ethers.utils.getAddress(data.request.to)
                recipientName = members[recipientAddress]?.name || null
                denom = 'ETH'
                rawAmount = req.value
                amount = ethers.utils.formatEther(req.value)
            } else {
                // token transfer
                const tokenInput = this.tokenInterface.decodeFunctionData('transfer', data.request.data)
                tokenAddress = data.request.to
                const tokenContract = new ethers.Contract(tokenAddress, TokenArtifact.abi, this.provider)
                denom = await tokenContract.symbol()
                const decimal = await tokenContract.decimals()
                recipientAddress = ethers.utils.getAddress(tokenInput.to)
                recipientName = members[recipientAddress]?.name || null
                rawAmount = Number(tokenInput.amount.toString())
                amount = Number(ethers.utils.formatUnits(tokenInput.amount, decimal))
            }
            const request: Request = {
                name: data.request.name,
                detail: data.request.detail,
                attachment: data.request.attachments,
                recipientAddress,
                recipientName,
                requesterName: members[req.requester]?.name || null,
                requesterAddress: req.requester,
                requestTimestamp: dayjs.unix(req.createdTimestamp).toDate(),
                requestTxhash: req.createdTxhash,
                status,
                tokenAddress,
                denom,
                rawAmount,
                amount,
                rawBudget: req.budget,
                budget: Number(ethers.utils.formatUnits(req.budget, 'mwei').toString()),
                approverAddress,
                approverName,
                approveTxhash,
                approveTimestamp
            }
            requests.push(request)
        }))
        return requests
    }
}
