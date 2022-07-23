export const generalConfig = () => ({
    graph: {
        uri: process.env.GRAPH_URI || ''
    },
    eth: {
        uri: process.env.ETH_URI || ''
    }
})