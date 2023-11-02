const express = require('express')
const handlebars = require('express-handlebars')
const app = express()
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const session = require('express-session')

const routes = require('./routes/index')
const port = 3000
const SESSION_SECRET = 'secret'

app.engine('hbs', handlebars({ defaultLayout: 'main', extname: '.hbs' }))
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
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_messages = req.flash('warning_messages')
  res.locals.notice_messages = req.flash('notice_messages')
  next()
})

app.use(routes)

app.listen(port, () => {
  console.log(`app is running on http://localhost:${port}`)
})

module.exports = app
