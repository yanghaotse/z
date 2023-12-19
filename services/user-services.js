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
  },
  getUserFollowers: async(req, cb) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)
      const user = await User.findByPk(userId, {
        include: [
          Tweet,
          { model: User, as: 'Followers'}
        ]
      })
      if (!user) {
        const err = new Error('使用者資料不存在')
        err.status = 404
        throw err
      }

      const { Tweets, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        tweetsCount: Tweets.length
      }
      const followers = userData.Followers.map(follower => ({
        ...follower,
        isFollowed: currentUser.Followings.some(cf => cf.id === follower.id),
        isNotUser: follower.id !== currentUser.id
      }))

      return cb(null, { user: userData, followers, recommendFollowings, currentUser })
    } catch(err) {
      cb(err)
    }
  },
  getUserFollowings: async(req, cb) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const user = await User.findByPk(userId, {
        include:[
          Tweet,
          { model: User, as: 'Followings' }
        ]
      })
      if (!user) {
        const err = new Error('使用者資料不存在')
        err.status = 404
        throw err
      }

      const { Tweets, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        tweetsCount: Tweets.length
      }
      const followings = userData.Followings.map(following => ({
        ...following,
        isFollowed: currentUser.Followings.some(cf => cf.id === following.id),
        isNotUser: following.id !== currentUser.id
      }))

      return cb(null, { user: userData, followings, recommendFollowings, currentUser })
    } catch(err) {
      cb(err)
    }
  },
  getUserReplies: async(req, cb) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)

      const user = await User.findByPk(userId, {
        include: [
          // user-header: tweetsCount
          Tweet,
          // user-profile: user
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' },
          // user-replies: replies 
          { model:Reply,include: [
            User,
            { model: Tweet, include: [User] }
          ],
            order:[['createdAt', 'DESC']] 
          }
        ]
      })
      if (!user) {
        const err = new Error('使用者資料不存在')
        err.status = 404
        throw err
      }

      const { followingsCount, followersCount, tweetsCount, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        followingsCount: rest.Followings.length,
        followersCount: rest.Followers.length,
        tweetsCount: rest.Tweets.length,
        isFollowed: currentUser.Followings.some(cf => cf.id === rest.id)
      }
      const replies = userData.Replies

      return cb(null, { user: userData, replies, recommendFollowings, currentUser })
    } catch(err) {
      cb(err)
    }
  },
  getUserLikes: async(req, cb) => {
    try {
      const userId = req.params.id
      const currentUser = getUser(req)
      const recommendFollowings = await getRecommendedFollowings(currentUser.id)
      const user = await User.findByPk(userId, {
        include: [
          // user-profile: user, followingsCount, followersCount
          Tweet,
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' },
          // user-likes: repliesCount, likesCount
          { model: Tweet, as: 'LikedTweets', include: [User, Reply, Like]}
        ]
      })
      if (!user) {
        const err = new Error('使用者資料不存在')
        err.status = 404
        throw err
      }

      const { followingsCount, followers, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        followingsCount: rest.Followings.length,
        followersCount: rest.Followers.length,
        tweetsCount: rest.Tweets.length,
        isFollowed: currentUser.Followings.some(cf => cf.id === rest.id)
      }

      const likedTweets = userData.LikedTweets.map(lt => ({
        ...lt,
        repliesCount: lt.Replies.length,
        likesCount: lt.Likes.length
      }))
      likedTweets.sort((a, b) => b.Like.createdAt - a.Like.createdAt)

      return cb(null, { user: userData, likedTweets, recommendFollowings, currentUser })
    } catch(err) {
      cb(err)
    }
  },
  getUserSetting: async(req, cb) => {
    try {
      const currentUser = getUser(req)
      const paramsUserId = Number(req.params.id)
      if (!currentUser) {
        const err = new Error('使用者不存在')
        err.status = 404
        throw err
      }
      if (paramsUserId !== currentUser.id) {
        const err = new Error('無法修改他人資料')
        err.status = 403
        throw err
      }
      return cb(null, { currentUser })
    } catch(err) {
      cb(err)
    }
  },
  addFollowing: async(req, cb) => {
    let createFollowShip
    try {
      const currentUserId = Number(getUser(req).id)
      const followingId = Number(req.body.id)
      console.log('currentUserId', currentUserId)
      console.log('followingId', followingId)
      if (!followingId || isNaN(followingId)) {
        const err = new Error('該用戶不存在')
        err.status = 404
        throw err
      }

      if (followingId === currentUserId) {
        const err = new Error('不能追蹤自己')
        err.status = 409
        throw err
      } else {
        const [user, followShip] = await Promise.all([
          User.findByPk(currentUserId),
          Followship.findOne({
            where: {
              followingId,
              followerId: currentUserId
            }
          })
        ])
        if (!user) {
          const err = new Error('使用者不存在')
          err.status = 404
          throw err
        }
        if (followShip) {
          const err = new Error('已追蹤用戶')
          err.status = 409
          throw err
        }

        createFollowShip = await Followship.create({
          followingId,
          followerId: currentUserId
        })
      }

      return cb(null, { createFollowShip: createFollowShip.toJSON() })
    } catch(err) {
      cb(err)
    }
  },
  removeFollowing: async(req, cb) => {
    try {
      const currentUserId = Number(getUser(req).id)
      const followingId = Number(req.params.id)
      const followShip = await Followship.findOne({
        where: {
          followingId,
          followerId: currentUserId
        }
      })
      if (!followShip) {
        const err = new Error('未追蹤該用戶')
        err.status = 409
        throw err
      }
      await followShip.destroy()
      return cb(null, { removeFollowShip: followShip.toJSON() })
    } catch(err) {
      cb(err)
    }
  },
  putUserSetting: async(req, cb) => {
    try {
      const currentUser = getUser(req)
      const { account, name, email, password, passwordCheck } = req.body

      if (!account || !name || !email) {
        const err = new Error ('帳戶、名稱、Email 為必填欄位')
        err.status = 400
        throw err
      }
      if (password !== passwordCheck) {
        const err = new Error('密碼與確認密碼不相符')
        err.status = 412
        throw err
      }
      if (name > 50) {
        const err = new Error('字數超出上限')
        err.status = 413
        throw err
      }

      // 查詢是否有已存在的 account 或 email(不包含當前使用者account、email)
      const existingUserData = await User.findOne({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { account: account },
                { account: { [Op.notLike]: currentUser.account }}
              ]
            },
            {
              [Op.and]: [
                { email: email },
                { email: { [Op.notLike]: currentUser.email }}
              ]
            }
          ]
        }
      })
      if (existingUserData) {
        if (existingUserData.toJSON().account === account) {
          const err = new Error('帳號已經被使用')
          err.status = 409
          throw err
        }
        if (existingUserData.toJSON().email === email) {
          const err = new Error('Email 已經被使用')
          err.status = 409
          throw err
        }
      }

      const user = await User.findByPk(currentUser.id)
      if (!user) {
        const err = new Error('使用者不存在')
        err.status = 404
        throw err
      }

      let updatedUser
      // 若使用者有更改密碼
      if (password) {
        const hashPassword = await bcrypt.hash(password, 10)
        updatedUser = await user.update({
          account,
          name,
          email,
          password: hashPassword
        })
      } else {
        updatedUser = await user.update({
          account,
          name,
          email
        })
      }
      updatedUser = updatedUser.toJSON()

      return cb(null, { updatedUser })
    } catch(err) {
      cb(err)
    }
  },
  putUserProfile: async(req, cb) => {
    try {
      const currentUser = getUser(req)
      const { name, introduction } = req.body
      const avatar = req.files.avatar ? req.files.avatar[0] : null
      const cover = req.files.cover ? req.files.cover[0] : null

      if (!name) {
        const err = new Error('名稱不可空白')
        err.status = 400
        throw err
      } 
      if (name.length > 50 ) {
        const err = new Error('字數不可超過50字')
        err.status = 413
        throw err
      } 
      if (introduction.length > 160) {
        const err = new Error('字數不可超過160字')
        err.status = 413
        throw err
      }

      const user = await User.findByPk(currentUser.id)
      if (!user) {
        const err = new Error('使用者不存在')
        err.status = 404
        throw err
      }

      const imgurAvatar = await imgurFileHandler(avatar)
      const imgurCover = await imgurFileHandler(cover)

      let updatedUser = await user.update({
        name,
        introduction,
        avatar: imgurAvatar || currentUser.avatar,
        cover: imgurCover || currentUser.cover
      })
      updatedUser = updatedUser.toJSON()
      return cb(null, { updatedUser })
    } catch(err) {
      cb(err)
    }
  }
}


module.exports = userService