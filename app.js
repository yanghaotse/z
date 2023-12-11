if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const handlebars = require('express-handlebars')
const app = express()
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const { Server } = require('socket.io')
const http = require('http')

const routes = require('./routes/index')
const { getUser } = require('./helpers/auth-helpers')
const handlebarsHelpers = require('./helpers/handlebars-helpers')

const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET
// socket.io
const server = http.createServer(app)
const io = new Server(server)

app.engine('hbs', handlebars({ defaultLayout: 'main', extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.json())
app.use(session({ 
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// middleware
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_messages = req.flash('warning_messages')
  res.locals.notice_messages = req.flash('notice_messages')
  res.locals.user = getUser(req)
  req.io = io
  next()
})

app.use(routes)

server.listen(port, () => {
  console.log(`app is running on http://localhost:${port}`)
})

module.exports = app
