export interface Request {
    name: string
    detail: string
    attachment: string
    recipient: string
    requesterName: string
    requesterAddress: string
    requestTxhash: string
    requestTimestamp: Date
    status: string
    denom: string
    rawAmount: number
    amount: number
    budget: number
    rawBudget: number
    tokenAddress?: string
    approverName?: string
    approverAddress?: string
    approveTxhash?: string
    approveTimestamp?: Date
}