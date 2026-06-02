const _ = require('lodash')

const dummy = (blogs) => {
  return blogs.length + 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const reducer = (sum, item) => {
    return sum + item
  }

  return blogs.length === 0
  ? 0
  : likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = Math.max(...blogs.map(blog => blog.likes))

  return blogs.filter(blog => blog.likes === favorite)
}

const mostBlog = (blogs) => {
  const mostAuthor = _(blogs)
    .countBy('author')
    .entries()
    .maxBy(_.last)

  return {'author': mostAuthor[0], 'blogs': mostAuthor[1]}
}

const mostLiked = (blogs) => {
  const likedAuthor = _(blogs)
    .groupBy('author')
    .mapValues((blog) => _.sumBy(blog, 'likes'))
    .entries()
    .maxBy(_.last)
  

  return {'author': likedAuthor[0], 'likes': likedAuthor[1]}
}
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlog,
  mostLiked,
}