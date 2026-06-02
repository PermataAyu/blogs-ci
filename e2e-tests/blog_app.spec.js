const { test, expect, beforeEach, describe } = require('@playwright/test')
const {loginWith, createBlog, likeBlog} = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Naufal Tsabit',
        username: 'novelty',
        password: 'secret'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Arto Hellas',
        username: 'harto',
        password: 'salainen'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText('log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('suceeds with correct credentials', async ({page}) => {
      await loginWith(page, 'novelty', 'secret')
      await expect(page.getByText('Naufal Tsabit logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({page}) => {
      await loginWith(page, 'hacker', 'magic')

      const errorDiv = page.locator('.notif')
      await expect(errorDiv).toContainText('wrong username or password')
    })
  })

  describe('When logged in', () => {
    beforeEach( async ({page}) => {
      await loginWith(page, 'novelty', 'secret')
    })

    test('a new blog can be created', async ({page}) => {
      await createBlog(page, 'Blog Created with Playwright', 'Playwright', 'http://localhost:9323')
      
      const blogDiv = page.locator('.blog').filter({hasText: 'Blog Created with Playwright'})
      await expect(blogDiv).toContainText('Blog Created with Playwright')
    })

    describe('and several blogs exists', () => {
      beforeEach(async ({page}) => {
        await createBlog(page, 'A Blog', 'anon', 'http://localhost:5173')
        await likeBlog(page, 'A Blog', 5)
        await createBlog(page, 'Another Blog', 'anon', 'http://localhost:5173')
        await likeBlog(page, 'Another Blog', 9)
      })

      test('a blog can be liked', async ({page}) => {
        await page.pause()
        await page.getByText('A Blog').getByRole('button', {name: 'view'}).click()
        await page.getByRole('button', {name: 'like'}).click()

        await expect(page.getByText('likes 6')).toBeVisible()
      })

      describe('deletion', () => {
        beforeEach ( async ( { page } ) => {
          await createBlog(page, 'Another nother blog', 'anon', 'http://localhost:5173')
          await page.getByRole('button', {name: 'logout'}).click()
        })
        test('can be done by the owner', async ({page}) => {
          await loginWith(page, 'novelty', 'secret')
          await page
            .locator('.blog')
            .getByText('Another nother blog')
            .getByRole('button', {name: 'view'}).click()
          page.on('dialog', async dialog => {
            await dialog.accept()
          })
          await page.getByRole('button', {name: 'delete'}).click()
          await page.pause()
          await expect(page.locator('.blog').getByText('Another nother blog')).not.toBeVisible()
        })

        test('cannot be done by others', async ({page}) => {
          await loginWith(page, 'harto', 'salainen')
          await page
            .locator('.blog')
            .getByText('Another nother blog')
            .getByRole('button', {name: 'view'}).click()
          await expect(page.getByRole('button', {name: 'delete'})).not.toBeVisible()
        })
      })

      test('blogs ordered with the most amount of likes', async ({page})=> {
        const blogLists = await page.locator('.blog').all()
        console.log(blogLists[0])
        await expect(blogLists[0]).toContainText('Another Blog')
        await expect(blogLists[1]).toContainText('A Blog')
      })
    })
  })
})