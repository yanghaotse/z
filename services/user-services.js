const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Followship, Like } = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../helpers/user-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userService = {
  signup: async(req, cb) => {
    const { account, name, email, password, checkPassword } = req.body
    try {
      if (!account || !name || !email || !password || !checkPassword) {
        const err = new Error('所有欄位都為必填')
        err.status = 400
        throw err
      }
      if (password !== checkPassword) {
        const err = new Error('密碼與確認密碼不符!')
        err.status = 412
        throw err
      }
      if (name.length > 50) {
        const err = new Error('字數超出上限!')
        err.status = 413
        throw err
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { account: account },
            { email: email }
          ]
        }
      })
      if (existingUser) {
        if (existingUser.toJSON().account === account) {
          const err = new Error('帳號已經被使用!')
          err.status = 409
          throw err
        }
        if (existingUser.toJSON().email === email) {
          const err = new Error('Email 已經被使用!')
          err.status = 409
          throw err
        }
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const createUser = await User.create({
        account,
        name,
        email,
        password: hashPassword,
        role: 'user'
      })

      return cb(null, { createUser })
    } catch(err) {
      cb(err)
    }
  },
  getUserTweets: async(req, cb) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const user = await User.findByPk(userId, {
        include: [
          // user-profile
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets' },
          // user-tweets
          { model: Tweet, include: [
            User,
            Reply,
            { model: User, as: 'LikedUsers' }
          ],
          order: [
            ['createdAt', 'DESC']
          ]}
        ]
      })
      if (!user) {
        const err = new Error('使用者不存在')
        err.status = 404
        throw err
      }
      // user-profile
      const { followingsCount, followersCount, tweetsCount, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        followingsCount: rest.Followings.length,
        followersCount: rest.Followers.length,
        tweetsCount: rest.Tweets.length,
        isFollowed: currentUser.Followings.some(cf => cf.id === rest.id)
      }
      // user-tweets
      const tweetsData = user.Tweets.map( tweet => ({
        ...tweet.toJSON(),
        repliesCount: tweet.Replies.length,
        likesCount: tweet.LikedUsers.length,
        isLiked: tweet.LikedUsers.some(lu => lu.id === currentUser.id)
      }))

      return cb(null, { user: userData, tweets: tweetsData, currentUser, recommendFollowings })
    } catch(err) {
      cb(err)
    }
  }
}


module.exports = userService