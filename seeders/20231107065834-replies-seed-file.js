'use strict'

/** @type {import('sequelize-cli').Migration} */

const faker = require('faker')
const { User, Tweet } = require('../models')

// 每篇tweet都有3則留言
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const users = await User.findAll({ raw: true, nest: true })
      const tweets = await Tweet.findAll({ raw: true, nest: true })
      const replies = []

      tweets.forEach(tweet => {
        const replyPerTweet = 3
        for (let i = 0; i < replyPerTweet; i++) {
          const maxLength = 140
          let reply = {
            user_id: users[Math.floor(Math.random() * users.length)].id,
            tweet_id: tweet.id,
            comment: faker.lorem.text().slice(0, maxLength),
            created_at: new Date(),
            updated_at: new Date()
          }
          replies.push(reply)
        }
      })
      await queryInterface.bulkInsert('Replies', replies, {})
    } catch(err) {
      console.log(err)
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Replies', {})
  }
}
