import { ApolloClient, gql, InMemoryCache, HttpLink, Transaction } from '@apollo/client/core'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fetch from 'cross-fetch'

@Injectable()
export class GraphService {
    private client: ApolloClient<any>

    constructor(private readonly configService: ConfigService) {
        const uri = this.configService.get<string>('graph.uri')
        this.client = new ApolloClient({
            link: new HttpLink({
                uri: uri,
                fetch
            }),
            cache: new InMemoryCache(),
            defaultOptions: {
                query: {
                    errorPolicy: 'ignore'
                }
            }
        })
    }

    async query(query: string) {
        try {
            const result = await this.client.query({
                query: gql`
          ${query}
        `,
            })
            return result
        } catch (err) {
            console.error(err)
        }
    }
}
