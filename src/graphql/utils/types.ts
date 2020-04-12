export type TokenInputType = {
	token: string;
}

export const tokenInput = `
	input TokenInput {
		token: String!
	}
`

export type PagingType = {
	page: number;
	pageSize: number;
}

export const paging = `
	input Paging {
		page: Int!
		pageSize: Int!
	}
`

export type PagingSizeType = {
	pageSize: number;
}


export type MessagePayloadType = {
	message: string;
}

export const messagePayload = `
	type MessagePayload {
		message: String!
	}
`