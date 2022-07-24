import { ApolloClient, gql, InMemoryCache, HttpLink, Transaction } from '@apollo/client/core'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom, Observable } from 'rxjs'

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
        console.log(this.uri)
        const result = await lastValueFrom(this.httpService.get(`${this.uri}/v1/${this.chainId}/address/${address}/balances_v2`, {
            params: {
                'quote-currency': 'USD',
                format: 'JSON',
                nft: false,
                'no-nft-fetch': true,
                key: this.key
            }
        }))
        console.log('covalent')
        console.log(result)
        return result
    }
}
