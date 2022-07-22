export interface Vault {
    name: string
    address: string
    owner: string
    admins: Member[]
    approvers: Approver[]
    members: Member[]
    balance?: number
    income?: number
    expenses?: number
}

export interface Member {
    address: string
    name: string
}

export interface Approver {
    address: string
    name: string
    budget: number
}