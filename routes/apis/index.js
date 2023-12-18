const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')
const adminController = require('../../controllers/apis/admin-controller')
const admin = require('./modules/admin')
const { authenticated, authenticateAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.post('/admin/signin', passport.authenticate('local', { session: false }), adminController.adminSignIn)
router.use('/admin', authenticateAdmin, admin)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/tweets/:id/like', authenticated, tweetController.addLike)
router.get('/tweets', authenticated, tweetController.getTweets)

router.use('/', apiErrorHandler)


module.exports = router