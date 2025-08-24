import React from 'react'

/**
 * Keyboard-accessible skip links to jump to key landmarks.
 * Add matching ids in the layout: #main-content, #site-nav, #app-sidebar, #product-search
 */
export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="skip-links-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <a href="#site-nav" className="skip-link">Skip to navigation</a>
      <a href="#app-sidebar" className="skip-link">Skip to sidebar</a>
      <a href="#product-search" className="skip-link">Skip to search</a>
    </nav>
  )
}

export default SkipLinks
