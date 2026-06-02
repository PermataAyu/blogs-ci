import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({username, password})

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setMessage('wrong username or password')
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setMessage(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const addLike = id => {
    const blog = blogs.find(b => b.id === id)
    const changeBlog = {...blog, likes: blog.likes + 1}

    blogService
      .update(id, changeBlog)
      .then(returnedBlog => {
        setBlogs(blogs.map(b => b.id === id ? returnedBlog : b))
      })
  }
  
  const blogForm = () => (
    <Togglable buttonLabel = "create new blog" ref = {blogFormRef}>
      <BlogForm 
        createBlog={addBlog}
      />
    </Togglable>
  )

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const removeBlog = async (id, title, author) => {
    if (confirm(`Remove blog ${title} by ${author}`)) {
      await blogService
        .remove(id)
        .then(returnedBlog => {
          setBlogs(blogs.filter(b => b.id !== returnedBlog.id))
        })
    }
    
  }


  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification message={message}/>
        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input 
                type='text' 
                value={username} 
                onChange={({target}) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              password
              <input 
                type='password'
                value={password}
                onChange={({target}) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type='submit'>login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message}/>
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
      {blogForm()}
      {(blogs.sort((a, b) => b.likes - a.likes)).map(blog => 
        <Blog 
          key={blog.id} 
          blog={blog} 
          addLike={() => addLike(blog.id)} 
          removeBlog = {() => removeBlog(blog.id, blog.title, blog.author)} 
          user = {user.name}
        />
      )}
    </div>
  )
}

export default App