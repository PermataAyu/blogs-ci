const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', {name: 'login'}).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', {name: 'create new blog'}).click()
  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)
  await page.getByRole('button', {name: 'create'}).click()
  await page.pause()
  await page.locator('.blog').getByText(title).waitFor()
}

const likeBlog = async (page, title, count) => {
  await page.getByText(title).getByRole('button', {name: 'view'}).click()
  for (let i=0; i<count; i++) {
    await page.getByRole('button', {name: 'like'}).click()
    await page.getByText(title).getByText(`likes ${i+1}`).waitFor()
  }
  await page.getByRole('button', {name: 'hide'}).click()
}

export {loginWith, createBlog, likeBlog}