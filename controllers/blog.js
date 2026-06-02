const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {blogs:0})
  response.json(blogs)
})

blogRouter.post('/', userExtractor, async (request, response) => {
  const {title, author, url} = request.body
  const user = request.user

  if (!author) {
    return response.status(400).json({
      error: 'author missing'
    })
  } else if (!url) {
    return response.status(400).json({
      error: 'url missing'
    })
  } else if (!user._id) {
    return response.status(400).json({
      error: 'userId missing or not found'
    })
  }

  const blog = new Blog({
    title,
    author,
    url,
    user: user._id,
    likes: 0,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  return response.status(201).json(await savedBlog.populate('user', {blogs:0}))
})

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user

  if (!(blog.user.toString() === user._id.toString())) {
    return response.status(401).json({error: 'invalid token'})
  }  

  await blog.deleteOne()
  response.json(blog)
})

blogRouter.put('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {blogs:0})
  blog.likes = blog.likes + 1
  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})
module.exports = blogRouter