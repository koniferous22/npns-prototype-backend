module.exports = {
	calculatePageCount: (documentCount, pageSize) => Math.floor(documentCount / pageSize) + (documentCount % pageSize > 0 ? 1 : 0)
}