import { Injectable } from '@nestjs/common';
import { Vault } from 'src/interfaces/vault';
import { GraphService } from './graph.service';

@Injectable()
export class VaultService {

    constructor(
        private readonly graphService: GraphService
    ) {

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
                vaultSet.add(`${v.id}`)
            })
            const approverResult = await this.graphService.query(queryApprover)
            approverResult.data.approvers.forEach(v => {
                vaultSet.add(`${v.id}`)
            })
            const memberResult = await this.graphService.query(queryMember)
            memberResult.data.members.forEach(v => {
                vaultSet.add(`${v.id}`)
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
                        id
                        name
                      }
                      approvers {
                        id
                        name
                        budget
                      }
                      members {
                        id
                        name
                      }
                    }
                  }`
                const vaultResult = await this.graphService.query(queryVault)
                const admins = vaultResult.data.vault.admins.map(a => {
                    return {
                        address: a.id,
                        name: a.name
                    }
                })
                const approvers = vaultResult.data.vault.approvers.map(ap => {
                    return {
                        address: ap.id,
                        name: ap.name,
                        budget: ap.budget
                    }
                })
                const members = vaultResult.data.vault.members.map(m => {
                    return {
                        address: m.id,
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
}
