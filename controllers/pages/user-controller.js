const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Followship, Like } = require('../../models')
const { Op } = require('sequelize')
const { getUser } = require('../../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../../helpers/user-helpers')
const { imgurFileHandler } = require('../../helpers/file-helpers')


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
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
      return res.redirect('/signin')
    } catch(err) {
      next(err)
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    return res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    return res.redirect('/signin')
  },
  getUserTweets: async(req, res, next) => {
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
      if (!user) throw new Error('使用者不存在')
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

      return res.render('user/user-tweets', { user: userData, tweets: tweetsData, currentUser, recommendFollowings })
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
          Tweet,
          { model: User, as: 'Followers'}
        ]
      })
      if (!user) throw new Error('使用者資料不存在')

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

      return res.render('user/user-followers', { user: userData, followers, recommendFollowings, currentUser })
    } catch(err) {
      next(err)
    }
  },
  getUserFollowings: async(req, res, next) => {
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
      if (!user) throw new Error('使用者資料不存在')

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

      return res.render('user/user-followings', { user: userData, followings, recommendFollowings, currentUser })
    } catch(err) {
      next(err)
    }
  },
  getUserReplies: async(req, res, next) => {
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
      if (!user) throw new Error('使用者資料不存在')

      const { followingsCount, followersCount, tweetsCount, ...rest } = user.toJSON()
      const userData = {
        ...rest,
        followingsCount: rest.Followings.length,
        followersCount: rest.Followers.length,
        tweetsCount: rest.Tweets.length,
        isFollowed: currentUser.Followings.some(cf => cf.id === rest.id)
      }
      const replies = userData.Replies

      return res.render('user/user-replies', { user: userData, replies, recommendFollowings, currentUser })
    } catch(err) {
      next(err)
    }
  },
  getUserLikes: async(req, res, next) => {
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
      if (!user) throw new Error('使用者資料不存在')

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

      return res.render('user/user-likes', { user: userData, likedTweets, recommendFollowings, currentUser })
    } catch(err) {
      next(err)
    }
  },
  getUserSetting: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      if (!currentUser) throw new Error('使用者不存在')
      return res.render('user/user-setting', { currentUser })
    } catch(err) {
      next(err)
    }
  },
  addFollowing: async(req, res, next) => {
    try {
      const currentUserId = Number(getUser(req).id)
      const followingId = Number(req.body.id)
      if (!followingId || isNaN(followingId)) throw new Error('該用戶不存在')

      if (followingId === currentUserId) {
        req.flash('error_messages', '不能追蹤自己')
        return res.redirect('back')
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
        if (!user) throw new Error('使用者不存在')
        if (followShip) throw new Error('已追蹤用戶')

        await Followship.create({
          followingId,
          followerId: currentUserId
        })
      }

      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  removeFollowing: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const followingId = req.params.id
      const followShip = await Followship.findOne({
        where: {
          followingId,
          followerId: currentUser.id
        }
      })
      if (!followShip) throw new Error('未追蹤該用戶')
      await followShip.destroy()
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  putUserSetting: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const { account, name, email, password, passwordCheck } = req.body

      if (!account || !name || !email) throw new Error ('帳戶、名稱、Email 為必填欄位')
      if (password !== passwordCheck) throw new Error('密碼與確認密碼不相符')
      if (name > 50) throw new Error('字數超出上限')

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
        if (existingUserData.toJSON().account === account) throw new Error('帳號已經被使用')
        if (existingUserData.toJSON().email === email) throw new Error('Email 已經被使用')
      }
      // 若使用者有修改密碼
      if (password) {
        const hashPassword = await hash.bcrypt(password, 10)
        await User.update({
          account,
          name,
          email,
          password: hashPassword
        }, {
          where: {
            id: currentUser.id
          }
        })
      } else {
        await User.update({
          account,
          name,
          email
        }, {
          where: {
            id: currentUser.id
          }
        })
      }

      req.flash('success_messages', '編輯成功!')
      return res.redirect(`/users/${currentUser.id}/setting`)
    } catch(err) {
      next(err)
    }
  },
  putUserProfile: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const { name, introduction } = req.body
      const avatar = req.files.avatar ? req.files.avatar[0] : null
      const cover = req.files.cover ? req.files.cover[0] : null
      const user = await User.findByPk(currentUser.id, { raw: true, nest: true })

      if (!name) throw new Error('名稱不可空白')
      if (name.length > 50 ) throw new Error('字數不可超過50字')
      if (introduction.length > 160) throw new Error('字數不可超過160字')
      if (!user) throw new Error('使用者不存在')

      const imgurAvatar = await imgurFileHandler(avatar)
      const imgurCover = await imgurFileHandler(cover)

      await User.update(
        {
          name,
          introduction,
          avatar: imgurAvatar || currentUser.avatar,
          cover: imgurCover || currentUser.cover
        },
        {
          where: {
            id: currentUser.id
          }
        })

      req.flash('success_messages', '使用者資料更新成功')
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  deleteTweet: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const tweetId = req.body.id
      const tweet = await Tweet.findByPk(tweetId, {
        include: [User],
        raw: true,
        nest: true 
      })

      if (tweet.User.id !== currentUser.id) {
        req.flash('error_messages', '無法刪除他人貼文')
        return redirect('back')
      } else {
        await Tweet.destroy({ where: { id: tweetId }})
        await Reply.destroy({ where: { TweetId: tweetId }})
        await Like.destroy({ where: { TweetId: tweetId }})
      }
      
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  deleteReply: async(req, res, next) => {
    try {
      const currentUserId = getUser(req).id
      const replyId = req.body.id
      const reply = await Reply.findByPk(replyId, { raw: true, nest: true })
      if (!reply) throw new Error('回覆內容不存在')

      if (reply.userId !== currentUserId) {
        req.flash('error_messages', '無法刪除他人留言')
        return res.redirect('back')
      } else {
        await Reply.destroy({ where: { id: replyId }})
      }

      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  }
}


module.exports = userController