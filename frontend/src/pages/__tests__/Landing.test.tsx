import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../Landing'

// Wrapper to provide Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Landing Page', () => {
  it('should render the landing page', () => {
    renderWithRouter(<Landing />)
    // Check for A.W.A.R.E. heading or system name (multiple instances expected)
    const headings = screen.getAllByText(/A.W.A.R.E./i)
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have navigation links to dashboard', () => {
    renderWithRouter(<Landing />)
    // Should have link to dashboard or sign in
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should display key features section', () => {
    renderWithRouter(<Landing />)
    // Landing page should show feature highlights
    // Looking for common terms like "leak", "AI", "energy", etc.
    const content = screen.getAllByText(/autonomous|ai|leak|energy|water/i)
    expect(content.length).toBeGreaterThan(0)
  })

  it('should have call-to-action buttons', () => {
    renderWithRouter(<Landing />)
    const buttons = screen.getAllByRole('button')
    // Should have at least one CTA button
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render without errors', () => {
    expect(() => renderWithRouter(<Landing />)).not.toThrow()
  })
})
