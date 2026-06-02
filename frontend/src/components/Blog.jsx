import { useState } from "react"

const Blog = ({ blog, addLike, removeBlog, user}) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  let showDel
  let username


  const toggleVisibility = () => {
    setVisible(!visible)
  }

  if (blog.user) {
    showDel = { display: (blog.user.name === user) ? '' : 'none' } 
    username = blog.user.name
  }

  return (
    <div className="blog">
      {blog.title} {blog.author} 
      <button style={hideWhenVisible} onClick={toggleVisibility}>view</button>
      <button style={showWhenVisible} onClick={toggleVisibility}>hide</button>
      <div style={showWhenVisible}>
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}
          <button onClick={addLike}>like</button>
        </div>
        <div> {username} </div>
        <div>
          <button style={showDel} onClick={removeBlog}>delete</button>
        </div>
      </div>
    </div> 
  )
} 


export default Blog