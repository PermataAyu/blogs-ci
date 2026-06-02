import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const blog = {
  title: 'Component testing is done with react-testing-library',
  author: 'Naufal Tsabit',
  url: 'http://localhost:3003',
  likes: 7
}

const mockhandler = vi.fn()

describe('Blog Component', () => {
  beforeEach(() => {
    render(<Blog blog={blog} addLike={mockhandler}/>)
  })

  test('renders title and author, but not url or number of likes', async () => {
    const title = screen.getByText(
      'Component testing is done with react-testing-library',
      {exact:false}
    )
    const author = screen.getByText(
      'Naufal Tsabit',
      {exact:false}
    )
    const url = screen.getByText(
      'http://localhost:3003',
      {exact:false}
    )
    const likes = screen.getByText(
      '7',
      {exact:false}
    )

    // screen.debug()

    expect(title).toBeDefined()
    expect(author).toBeDefined()
    expect(url).not.toBeVisible()
    expect(likes).not.toBeVisible()
  })

  test('render url and number when button click', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)
    
    const url = screen.getByText('http://localhost:3003')
    const likes = screen.getByText(
      '7',
      {exact:false}
    )

    expect(url).toBeVisible()
    expect(likes).toBeVisible()
  })

  test('clicking the button calls event handler twice', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('like')
    await user.click(button)
    await user.click(button)

    expect(mockhandler.mock.calls).toHaveLength(2)
  })
})
