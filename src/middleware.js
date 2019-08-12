const jwt = require('jsonwebtoken')
const User = require('./models/user')

const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)
    try {
        // commented stuff does not work, but I can still access user by id
        const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        console.log(user)
        if (!user) {
            throw new Error("Token no longer valid")
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        console.log(JSON.stringify(error))
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = { auth }