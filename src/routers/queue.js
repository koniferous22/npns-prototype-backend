const Queue = require('../models/queue');
const { body, param, validationResult } = require('express-validator/check');

module.exports = (passport) => {
	const router = require('express').Router()

	router.get('/all', function(req,res,next) {
	        Queue.find({}, function(err, queuez) {
	        if (err) {
	            next(err);
	        } else {
	            res.set('Content-type','application/json');
	            res.send(queuez);
	        }
	    });
	});


	// PUBLIC CACHE
	router.get('/hierarchy', (req, res, next) => {
		Queue.find({}, (err, queuez) => {
			if (err) {
				next(err)
			}
			stop = false;
			dbQueues = new Object()
			queuez.forEach(q => {
				dbQueues[q._id] = {
					hierarchy_location: null,
					parentId: q.parentId,
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
			return res.send({
				hierarchy: hierarchy,
				success: true,
				message: "Lorem Ipsum"
			})
		})
	})

	// L8R REMOVE
	router.post('/add', (req, res, next) => {
		const { body } = req;
		let {
			name
		} = body;
		
		if (!name) {
			return res.send({
				success: false,
				message: 'Error: Name cannot be blank.'
			});
		}

		name = name.trim();

		Queue.find({
			name: name
		}, (err, previousQueues) => {
			if (err) {
				return res.send({
					success: false,
					message: 'Error: Server error'
				});
			} else if (previousQueues.length > 0) {
				return res.send({
					success: false,
					message: 'Error: Queue already exist.'
				});
			}

			// Save the new queue
			const newQueue = new Queue();

			newQueue.name = name;
			newQueue.save((err, queue) => {
				if (err) {
					return res.send({
						success: false,
						message: 'Error: Server error'
					});
				}
				return res.send({
					success: true,
					message: 'Queue created'
				});
			});
		});

	});

	router.get('/:id', [
	                param('id').isMongoId()
	        ], function(req,res,next) {
		        Queue.find({_id: req.params.id}, function(err, queue) {
		        if (err) {
		            next(err);
		        } else {
		            res.set('Content-type','application/json');
		            res.send(queue);
		        }
		    });
		});

	const descendantQueryMask = {
		id: 1,
		parentId: 1
	}
	// public cache
	router.get('/:id/descendants', [
			param('id').isMongoId()
		], (req, res, next) => {
			queue_id = req.params.id
			Queue.find({}, descendantQueryMask, (err, queuez) => {
				if (err) {
					next(err)
				} 
				if (queuez.map(q => String(q._id)).includes(queue_id)) {
					descendant_queues = [ queue_id ]
					//console.log(typeof descendant_queues[0])
					rest = queuez
					stop = false
					while(!stop) {
						new_rest = []
						for (var i  in rest) {
							if (descendant_queues.includes(String(rest[i]._id))) {
								continue
							} else if (descendant_queues.includes(String(rest[i].parentId))) {
								descendant_queues.push(rest[i]._id)
							} else {
								stop = true
								new_rest.push(rest[i])	
							}						
						}
						rest = new_rest
					}
					return res.send({
						success: true,
						message: "Nigga this shite is motherfucking descendant_queues",
						queues: descendant_queues
					})
				} else {
					return res.send({
						success: false,
						message: 'Error: No Such queue motherfucker'
					});	
				}
			})
		});

	return router;
}


