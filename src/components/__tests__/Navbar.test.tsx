import '@testing-library/jest-dom';
/**
 * VITEST TESTING TUTORIAL: Navbar Component
 * 
 * This file demonstrates how to write comprehensive tests for a React component using Vitest.
 * We'll cover:
 * 1. Basic rendering tests
 * 2. Testing links and navigation
 * 3. Testing user interactions
 * 4. Testing conditional rendering
 * 5. Snapshot testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';

/**
 * HELPER FUNCTION: Render with Router
 * 
 * Since Navbar uses react-router-dom's Link component,
 * we need to wrap it in a BrowserRouter for testing
 */
const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar productName="Na" />
    </BrowserRouter>
  );
};

/**
 * TEST SUITE: Navbar Component
 * 
 * describe() groups related tests together
 * Makes test output more organized and readable
 */
describe('Navbar Component', () => {
  
    it

  /**
   * TEST 1: Basic Rendering
   * 
   * This checks if the component renders without crashing
   * and if key elements are present in the DOM
   */
  it('should render the navbar without crashing', () => {
    renderNavbar();
    
    // screen.getByRole() is the preferred way to query elements
    // It's more accessible and represents how users interact with your app
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
  });

  /**
   * TEST 2: Brand/Logo Testing
   * 
   * Tests if the brand name and logo are displayed correctly
   */


  /**
   * TEST 3: Navigation Links
   * 
   * Verifies all main navigation links are present
   * Tests that they have the correct href attributes
   */
  it('should render all main navigation links', () => {
    renderNavbar();
    
    // getAllByRole() returns an array of matching elements
    const links = screen.getAllByRole('link');
    
    // We expect at least these links: Brand, Home, Partners dropdown items, Articles, Download App
    expect(links.length).toBeGreaterThan(5);
    
    // Test specific links by their text
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /articles/i })).toBeInTheDocument();
  });

  /**
   * TEST 4: Testing Link Destinations
   * 
   * Ensures links point to the correct routes
   */
  it('should have correct href attributes for navigation links', () => {
    renderNavbar();
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
    
    const articlesLink = screen.getByRole('link', { name: /articles/i });
    expect(articlesLink).toHaveAttribute('href', '/articles');
  });

  /**
   * TEST 5: Dropdown Menu Items
   * 
   * Tests the Partners dropdown menu and its items
   */
  it('should render Partners dropdown with all menu items', () => {
    renderNavbar();
    
    // Test dropdown toggle button
    const partnersDropdown = screen.getByRole('button', { name: /partners/i });
    expect(partnersDropdown).toBeInTheDocument();
    
    // Test dropdown menu items
    expect(screen.getByRole('link', { name: /our partners/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /partner benefits/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /become a partner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /restaurant partners/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /delivery partners/i })).toBeInTheDocument();
  });

  /**
   * TEST 6: Dropdown Link Destinations
   * 
   * Verifies dropdown items link to correct routes
   */
  it('should have correct href for dropdown items', () => {
    renderNavbar();
    
    const ourPartnersLink = screen.getByRole('link', { name: /our partners/i });
    expect(ourPartnersLink).toHaveAttribute('href', '/partners');
    
    const benefitsLink = screen.getByRole('link', { name: /partner benefits/i });
    expect(benefitsLink).toHaveAttribute('href', '/partner-benefits');
    
    const becomePartnerLink = screen.getByRole('link', { name: /become a partner/i });
    expect(becomePartnerLink).toHaveAttribute('href', '/become-partner');
  });

  /**
   * TEST 7: Download App Button
   * 
   * Tests the presence and attributes of the CTA button
   */
  it('should render Download App button', () => {
    renderNavbar();
    
    // Testing button by its text content
    const downloadButton = screen.getByRole('link', { name: /download app/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveClass('btn', 'btn-primary');
  });

  /**
   * TEST 8: Mobile Toggle Button
   * 
   * Tests if the mobile navigation toggle is present
   */
  it('should render mobile navigation toggle button', () => {
    renderNavbar();
    
    // Button with type="button" and specific data attributes
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('data-bs-toggle', 'collapse');
    expect(toggleButton).toHaveAttribute('data-bs-target', '#navbarNav');
  });

  /**
   * TEST 9: FontAwesome Icons
   * 
   * Tests if icons are rendered (via their parent elements)
   */
  it('should render FontAwesome icons', () => {
    const { container } = renderNavbar();
    
    // FontAwesome icons are rendered as SVG elements
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  /**
   * TEST 10: CSS Classes
   * 
   * Verifies Bootstrap classes are applied correctly
   */
  it('should have correct Bootstrap classes', () => {
    renderNavbar();
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('navbar', 'navbar-expand-lg', 'navbar-light', 'bg-white', 'shadow-sm', 'sticky-top');
  });

  /**
   * TEST 11: User Interaction - Click Event
   * 
   * This demonstrates how to test user interactions
   * Note: In a real scenario, you'd mock the router navigation
   */
  it('should handle click on navigation links', async () => {
    // Create user event instance
    const user = userEvent;
    renderNavbar();
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    
    // Click the link
    await user.click(homeLink);
    
    // In a real test with mocked router, you'd check if navigation occurred
    // For now, we just verify the link is still in the document
    expect(homeLink).toBeInTheDocument();
  });

  /**
   * TEST 12: Accessibility - ARIA Attributes
   * 
   * Tests important accessibility attributes
   */
  it('should have proper ARIA attributes', () => {
    renderNavbar();
    
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggleButton).toHaveAttribute('aria-controls', 'navbarNav');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle navigation');
    
    const partnersDropdown = screen.getByRole('button', { name: /partners/i });
    expect(partnersDropdown).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * TEST 13: Component Structure
   * 
   * Tests the overall structure of the component
   */
  it('should have correct structure with container and collapse div', () => {
    const { container } = renderNavbar();
    
    const navContainer = container.querySelector('.container');
    expect(navContainer).toBeInTheDocument();
    
    const collapseDiv = container.querySelector('#navbarNav');
    expect(collapseDiv).toBeInTheDocument();
    expect(collapseDiv).toHaveClass('collapse', 'navbar-collapse');
  });

  /**
   * TEST 14: Snapshot Test
   * 
   * Snapshot testing captures the rendered output
   * Great for catching unexpected UI changes
   * Run with --update or -u flag to update snapshots
   */
  it('should match snapshot', () => {
    const { container } = renderNavbar();
    expect(container).toMatchSnapshot();
  });
});

