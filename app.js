const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blog')
const usersRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const dns = require('node:dns/promises')

const app = express()

dns.setServers(['1.1.1.1'])

mongoose.connect(config.mongoUrl, {family:4})

app.use(express.json())
app.use(express.static('dist'))
app.use(middleware.tokenExtractor)
app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test' || process.env.CI) {
  const testingRouter = require('./controllers/test')
  app.use('/api/testing', testingRouter)
}
app.use(middleware.errorHandler)

module.exports = app