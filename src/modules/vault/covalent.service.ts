import { ApolloClient, gql, InMemoryCache, HttpLink, Transaction } from '@apollo/client/core'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, Observable } from 'rxjs'
import { ethers } from 'ethers'

@Injectable()
export class CovalentService {

    key: string
    chainId: string
    uri: string
    constructor(private readonly configService: ConfigService,
        private readonly httpService: HttpService) {
        this.key = this.configService.get<string>('covalent.key')
        this.chainId = this.configService.get<string>('eth.chainId')
        this.uri = 'https://api.covalenthq.com'
    }

    //https://api.covalenthq.com/v1/80001/address/0x34baa02f29b1d07135279cdb3ced75bce118974d/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_73ad4ad5a00f460bb567c04621f

    async getBalance(address: string) {
        const url = `${this.uri}/v1/${this.chainId}/address/${address}/balances_v2/`
        const result = await lastValueFrom(this.httpService.get(url, {
            params: {
                'quote-currency': 'USD',
                format: 'JSON',
                nft: false,
                'no-nft-fetch': true,
                key: this.key
            }
        }))
        let usdBalance = 0
        result.data.data.items.forEach(x => {
            const formatBalance = ethers.utils.formatUnits(x.balance, x.contract_decimals)
            usdBalance += Number(formatBalance) * x.quote_rate
        })
        return usdBalance
    }
}
