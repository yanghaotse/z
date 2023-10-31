const express = require('express')
const handlebars = require('express-handlebars')
const app = express()
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const port = 3000
const routes = require('./routes/index')


app.engine('hbs', handlebars({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.json())

app.use(routes)

app.listen(port, () => {
  console.log(`app is running on http://localhost:${port}`)
})

module.exports = app;
