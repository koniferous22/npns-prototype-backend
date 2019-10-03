const jwt = require('jsonwebtoken')
const User = require('./models/user')
const AuthToken = require('./models/auth_token')

const auth = async(req, res, next) => {
	//const header = req.header('Authorization') 
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const token_record = await AuthToken.findOne({token})
        if (!token) {
            throw new Error("Invalid token")
        }
        const user = await User.findOne({_id: token_record.user})
        //const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        if (!user) {
            throw new Error("Invalid token")
        }
        req.user = user
        req.token = token_record
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = { auth }