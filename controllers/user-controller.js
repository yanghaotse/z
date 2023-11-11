const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Followship, Like } = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../services/user-service')
const { ge } = require('faker/lib/locales')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async(req, res, next) => {
    const { account, name, email, password, checkPassword } = req.body
    try {
      if (!account || !name || !email || !password || !checkPassword) throw new Error('所有欄位都為必填')
      if (password !== checkPassword) throw new Error('密碼與確認密碼不符!')
      if (name.length > 50) throw new Error('字數超出上限!')

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { account: account },
            { email: email }
          ]
        }
      })
      if (existingUser) {
        if (existingUser.toJSON().account === account) throw new Error('帳號已經被使用!')
        if (existingUser.toJSON().email === email) throw new Error('Email 已經被使用!')
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const createUser = await User.create({
        account,
        name,
        email,
        password: hashPassword,
        role: 'user'
      })
      req.flash('success_messages', '成功註冊!')
      res.redirect('/signin')
    } catch(err) {
      next(err)
    }
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },
  getUserTweets: async(req, res, next) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const user = await User.findByPk(userId, {
        include: [
          // user-profile
          Reply,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets' },
          // user-tweets
          { model: Tweet, include: [
            User,
            Reply,
            { model: User, as: 'LikedUsers' }
          ]}
        ]
      })
      if (!user) throw new Error('使用者不存在')
      // user-profile
      const { followingsCount, followersCount, tweetsCount, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        followingsCount: rest.Followings.length,
        followersCount: rest.Followers.length,
        tweetsCount: rest.Tweets.length
      }
      // user-tweets
      const tweetsData = user.Tweets.map( tweet => ({
        ...tweet.toJSON(),
        repliesCount: tweet.Replies.length,
        likesCount: tweet.LikedUsers.length,
        isLiked: tweet.LikedUsers.some(lu => lu.id === currentUser.id)
      }))

      res.render('user/user-tweets', { user: userData, tweets: tweetsData, currentUser, recommendFollowings })
    } catch(err) {
      next(err)
    }
  },
  getUserFollowers: async(req, res, next) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)
      const user = await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers'}
        ]
      })
      if (!user) throw new Error('使用者不存在')

      const userData = user.toJSON()
      const followers = userData.Followers.map(follower => ({
        ...follower,
        isFollowed: currentUser.Followings.some(cf => cf.id === follower.id)
      }))

      res.render('user/user-followers', { users: userData, followers, recommendFollowings, currentUser })
    } catch(err) {
      next(err)
    }
  }
}


module.exports = userController