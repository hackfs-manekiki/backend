export const generalConfig = () => ({
    graph: {
        uri: process.env.GRAPH_URI || ''
    },
    eth: {
        uri: process.env.ETH_URI || '',
        chainId: process.env.CHAIN_ID || ''
    },
    covalent: {
        key: process.env.COVALENT_KEY || ''
    }
})