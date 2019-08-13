const router = require('express').Router()


router.get('/problems', function(req,res,next) {
    const user = await User.findOne({ _id: req.params.userid, 'tokens.token': token })
    if (!user) {
        throw new Error("Token no longer valid")
    }
});