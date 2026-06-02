const{test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./list_helper.test')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs has property id', async () => {
  const res = await api.get('/api/blogs')

  assert.strictEqual(res.body.every(blog => blog.hasOwnProperty('id')), true)
})

describe('Add a blog', () => {
  const newBlog = {
    title: 'A New Blog',
    author: 'Ada Lovelace',
    url: 'localhost:3003/api/blogs',
  }

  const newLogin = {
    "username": "novelty",
    "password": "secret"
  }
  
  test('Can be added', async () => {
    const auth = await api
      .post('/api/login')
      .send(newLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', auth.body.token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const contents = blogsAtEnd.map(b => b.title)

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    assert(contents.includes("A New Blog"))
  })

  test('new blog has zero likes', async () => {
    const auth = await api
      .post('/api/login')
      .send(newLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', auth.body.token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
  })

  test('only user can add a blog', async () => {
    const result = await api
      .post('/api/blogs')
      .set('Authorization', 'faketoken')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()

    assert(result.body.error.includes('invalid token'))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('Missing property', async () => {
  test('Missing author is not saved', async () => {
    const missingProp = 
      {
        title: 'Missing Author',
        url: 'localhost:3003/api/blogs', 
      }
    await api
      .post('/api/blogs')
      .send(missingProp)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('Missing url is not saved', async () => {
    const missingProp = 
      {
        title: 'Missing Author',
        author: 'Ada Lovelace', 
      }
    await api
      .post('/api/blogs')
      .send(missingProp)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

test('can edit blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToEdit = blogsAtStart[0]
  
  await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .expect(200)
  
  const blogsAtEnd = await helper.blogsInDb()
  const likes = blogsAtEnd[0].likes
  assert.strictEqual(likes, helper.initialBlogs[0].likes + 1)
})

test('owner can delete blog', async () => {
  const tempBlog = {
    title: 'A Temporary Blog',
    author: 'Ada Lovelace',
    url: 'localhost:3003/api/blogs',
  }

  const newLogin = {
    "username": "novelty",
    "password": "secret"
  }

  const auth = await api
    .post('/api/login')
    .send(newLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', auth.body.token)
    .send(tempBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[blogsAtStart.length - 1]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', auth.body.token)
    .expect(200)
  
  const blogsAtEnd = await helper.blogsInDb()
  const ids = blogsAtEnd.map(blog => blog.id)

  assert(!ids.includes(blogToDelete.id))
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

})

/* test('blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  const auth = await api
    .post('/api/login')
    .send(newLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', auth.body.token)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  const ids = blogsAtEnd.map(blog => blog.id)

  assert(!ids.includes(blogToDelete.id))
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length -1)
})   

test('blog can be edited', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToEdit = blogsAtStart[0]
  const auth = await api
    .post('/api/login')
    .send(newLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  console.log(auth)

  await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .set('Authorization', auth.body.token)
    .expect(204)
  
  const blogsAtEnd = await helper.blogsInDb()
  const likes = blogsAtEnd[0].likes
  assert.strictEqual(likes, helper.initialBlogs[0].likes + 1)
}) */

describe ('when there is only one user in db', async () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'novelty', name: 'Naufal Tsabit', passwordHash})

    await user.save()
  })

  const usersAtStart = await helper.usersInDb()

  test('create new user', async () => {
    const newUser = {
      username: 'Arto',
      name: 'Arto Hellas',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
      
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('reject ValidationError', async () => {
    const newUser = {
      username: 'adall',
      name: 'Ada Lovelace',
      password: 'he'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('User validation failed'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('reject MongoServerError', async () => {
    const newUser = {
      username:'novelty',
      name: 'Ada Lovelace',
      password: 'heilsatan'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('expected `` to be unique'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})