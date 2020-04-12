export const calculatePageCount = (documentCount: number, pageSize: number): number =>
	Math.floor(documentCount / pageSize) + (documentCount % pageSize > 0 ? 1 : 0)
