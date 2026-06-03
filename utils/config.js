require('dotenv').config()

const mongoUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI
const PORT = process.env.PORT || 3003

module.exports = {mongoUrl, PORT}