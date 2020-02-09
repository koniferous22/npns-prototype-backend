const QueueAPI = require('./models/queue');

const Queue = {
	//parentId: async (queue) => await QueueAPI.find({_id: queue.parentId}, '_id name parentId')
 /* descendatn query here
 * ascendant query here as well*/
}

const Query = {
	queues: async () => await QueueAPI.find({}, '_id name parentId').sort({name: 'asc'}).populate({path: 'parentId', select: '_id name parentId'}),
	queue: async (_, {name}) => {
		q = await QueueAPI.findOne( {name} , '_id name parentId').populate({path: 'parentId', select: '_id name parentId'})
		console.log(q)
		console.log(typeof q.parentId)
		return q
	}
}
const Mutation = {

}

module.exports = {
	Queue,
	Query,
	Mutation
}