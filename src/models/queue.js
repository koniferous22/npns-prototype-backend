const mongoose = require('mongoose');
const nested_set_plugin = require('mongoose-nested-set');

const model_name = 'Queue'

const QueueSchema = new mongoose.Schema({
	name: {
    	type: String,
    	unique: true,
    	trim: true,
    	required: true
	},
	depth: {
		type: Number,
		defualt: 0
	}
});

QueueSchema.plugin(nested_set_plugin)

QueueSchema.add({
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: model_name,
		index:true
	}
});

QueueSchema.static('getRoot', async function () {
	return this.findOne({"name":"Index"})
})

// here (next) => {} notation doesnt work :D
QueueSchema.pre('save', async function (next) {
	parent = await QueueModel.findOne({_id: this.parentId})
	if (!parent) {
		throw new Error('no parent found')
	}
	this.depth = parent.depth + 1
	next()
})

QueueSchema.post('save', async function (next) {
	rootNode = await QueueModel.getRoot()
	QueueModel.rebuildTree(rootNode,0, () => {})
	//next()
})

// redefine cause previous shit uses callbacks
QueueSchema.query.descendants = async function (recordFilter,fields) {
	self = await QueueModel.find(recordFilter)
	if (!self) {
		throw new Error('record not found')
	}
	filter = {
		lft: {
			$gte: Math.min(...(self.map(s => s.lft)))
		},
		rgt: {
			$lte: Math.max(...(self.map(s => s.rgt)))
		}
	}
	fields = fields || null

	result = await QueueModel.find(filter, fields)
	return result
}


QueueSchema.query.ancestors = async function (recordFilter,fields) {
	self = await QueueModel.find(recordFilter)
	console.log(self)
	if (!self) {
		throw new Error('record not found')
	}
	filter = {
		lft: {
			$lt: Math.max(...(self.map(s => s.lft)))
		},
		rgt: {
			$gt: Math.min(...(self.map(s => s.rgt)))
		}
	}
	fields = fields || null
	console.log(filter)
	result = await QueueModel.find(filter, fields)
	return result
}

QueueSchema.static('hierarchy', async function () {
	qs = await QueueModel.find({},'name parentId').sort({depth:1})

	dbQueues = new Object()
	qs.forEach(q => {
		dbQueues[q._id] = {
			hierarchy_location: null,
			parentId: q.parentId || null,
			name: q.name}
		})
	hierarchy = new Object()
	Object.keys(dbQueues).forEach(key => {
		// Verifies if queue is present in constructed data structure
		q = dbQueues[key]
		if (!q.name || q.hierarchy_location != null) {
			return
			//length > 0, i.e. already in hierarchy
		}
		// Insert ascendants until I reach existing ascendant
		// POST-CONDITION, for inserted element hierarchy_location MUST BE NON-EMPTY

		// constructs path from root of the hierarchy to parent object
		nonPresentAscendants = []
		ascendantIter = key
		while (ascendantIter != null && dbQueues[ascendantIter].hierarchy_location === null) {
			nonPresentAscendants.push(ascendantIter)
			ascendantIter = dbQueues[ascendantIter].parentId
		}
		nonPresentAscendants = nonPresentAscendants.reverse()
		// finds lowest existing ascendant
		lowestPresentAscendant = hierarchy
		if (ascendantIter != null) {
			// if exists, traverse existing hierarchy and find it
			
			dbQueues[ascendantIter].hierarchy_location.forEach(existingAscendant => {
				lowestPresentAscendant = lowestPresentAscendant[existingAscendant]
			})
		}

		// insert all non-existing ascendants
		// NOTE CAN BE DONE WAY EFFECTIVE, BUT I'M LAZY
		nonPresentAscendants.forEach(nonExistingAscendantId => {
			nonExistingAscendant = dbQueues[nonExistingAscendantId].name
			lowestPresentAscendant[nonExistingAscendant] = new Object()
			lowestPresentAscendant = lowestPresentAscendant[nonExistingAscendant]
			parentOfAscendantId = dbQueues[nonExistingAscendantId].parentId
			// update the access metadata
		
			dbQueues[nonExistingAscendantId].hierarchy_location = (dbQueues[nonExistingAscendantId].parentId === null) ? 
																	[] : 
																	dbQueues[nonExistingAscendantId].hierarchy_location = Array.from(dbQueues[parentOfAscendantId].hierarchy_location)
			dbQueues[nonExistingAscendantId].hierarchy_location.push(nonExistingAscendant)
		})
	})
	return hierarchy
})

QueueModel = mongoose.model(model_name,QueueSchema,model_name)

module.exports = QueueModel
