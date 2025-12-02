import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card component', () => {
      render(<Card data-testid="card">Test Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Test Card')
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class" data-testid="card" />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Header Content')
    })
  })

  describe('CardTitle', () => {
    it('should render card title as h3', () => {
      render(<CardTitle>Test Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Title')
    })

    it('should have correct default classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('text-2xl', 'font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Test Description</CardDescription>)
      const description = screen.getByText('Test Description')
      expect(description).toBeInTheDocument()
    })

    it('should render as paragraph element', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      const paragraph = container.querySelector('p')
      expect(paragraph).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Content')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer')
    })
  })

  describe('Complete Card', () => {
    it('should render all card components together', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Complete Card Title</CardTitle>
            <CardDescription>This is a complete card</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Complete Card Title')).toBeInTheDocument()
      expect(screen.getByText('This is a complete card')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })
})
