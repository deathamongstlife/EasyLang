// EasyLang Documentation - Interactive Enhancements
// Professional documentation site inspired by discord.js

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Copy Button for Code Blocks
  // ============================================

  document.querySelectorAll('pre').forEach(pre => {
    // Create copy button
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent;

      try {
        await navigator.clipboard.writeText(code);
        button.textContent = 'Copied!';
        button.style.background = '#3BA55D'; // Success color

        setTimeout(() => {
          button.textContent = 'Copy';
          button.style.background = ''; // Reset to default
        }, 2000);
      } catch (err) {
        button.textContent = 'Failed';
        button.style.background = '#ED4245'; // Error color

        setTimeout(() => {
          button.textContent = 'Copy';
          button.style.background = '';
        }, 2000);
      }
    });

    pre.appendChild(button);
  });

  // ============================================
  // Smooth Scrolling for Anchor Links
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if href is just "#"
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without jumping
        history.pushState(null, null, href);
      }
    });
  });

  // ============================================
  // Active Navigation Highlighting
  // ============================================

  const currentPath = window.location.pathname;

  // Highlight active page in sidebar
  document.querySelectorAll('.sidebar a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath && currentPath.includes(linkPath) && linkPath !== '/') {
      link.classList.add('active');
    }
  });

  // ============================================
  // Mobile Menu Toggle
  // ============================================

  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileToggle.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('active')
      );
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when window is resized to desktop size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // Sidebar Section Collapse (Optional Enhancement)
  // ============================================

  document.querySelectorAll('.sidebar h3').forEach(heading => {
    heading.style.cursor = 'pointer';
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');

    heading.addEventListener('click', () => {
      const nextElement = heading.nextElementSibling;
      if (nextElement && nextElement.tagName === 'UL') {
        nextElement.style.display = nextElement.style.display === 'none' ? '' : 'none';
      }
    });

    // Keyboard accessibility
    heading.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        heading.click();
      }
    });
  });

  // ============================================
  // Scroll to Top on Page Load (if hash present)
  // ============================================

  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // ============================================
  // Add "Back to Top" Button
  // ============================================

  const backToTopButton = document.createElement('button');
  backToTopButton.textContent = '↑';
  backToTopButton.className = 'back-to-top';
  backToTopButton.setAttribute('aria-label', 'Back to top');
  backToTopButton.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.2s ease;
    z-index: 999;
    box-shadow: var(--shadow-lg);
    display: none;
  `;

  document.body.appendChild(backToTopButton);

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopButton.style.display = 'block';
      setTimeout(() => backToTopButton.style.opacity = '1', 10);
    } else {
      backToTopButton.style.opacity = '0';
      setTimeout(() => backToTopButton.style.display = 'none', 300);
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.transform = 'scale(1.1)';
  });

  backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.transform = 'scale(1)';
  });

  // ============================================
  // Code Block Language Labels
  // ============================================

  document.querySelectorAll('pre code[class*="language-"]').forEach(code => {
    const pre = code.parentElement;
    const language = code.className.match(/language-(\w+)/);

    if (language) {
      const label = document.createElement('span');
      label.textContent = language[1];
      label.style.cssText = `
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        color: var(--code-text);
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
      `;
      pre.style.paddingTop = '3rem';
      pre.appendChild(label);
    }
  });

  // ============================================
  // External Link Icons
  // ============================================

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!link.querySelector('svg') && !link.classList.contains('no-icon')) {
      link.innerHTML += ' <svg style="display: inline-block; width: 0.875em; height: 0.875em; margin-left: 0.25em; vertical-align: middle;" fill="currentColor" viewBox="0 0 16 16"><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>';
    }
  });

  // ============================================
  // Table of Contents Generator (for long pages)
  // ============================================

  const content = document.querySelector('.content');
  if (content) {
    const headings = content.querySelectorAll('h2, h3');

    if (headings.length > 3) {
      const toc = document.createElement('div');
      toc.className = 'table-of-contents';
      toc.style.cssText = `
        background: var(--surface);
        padding: 1.5rem;
        border-radius: var(--radius-lg);
        margin-bottom: 2rem;
        border: 1px solid var(--border);
      `;

      const tocTitle = document.createElement('h3');
      tocTitle.textContent = 'On This Page';
      tocTitle.style.marginTop = '0';
      toc.appendChild(tocTitle);

      const tocList = document.createElement('ul');
      tocList.style.cssText = `
        list-style: none;
        padding-left: 0;
      `;

      headings.forEach((heading, index) => {
        // Add ID if not present
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        const listItem = document.createElement('li');
        listItem.style.paddingLeft = heading.tagName === 'H3' ? '1rem' : '0';

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.replace(/[🎯🤖🎵🔧⚡🛡️📨🎮⏰🔨]/g, '').trim();
        link.style.cssText = `
          color: var(--text);
          text-decoration: none;
          display: block;
          padding: 0.25rem 0;
          transition: color 0.2s ease;
        `;

        link.addEventListener('mouseenter', () => {
          link.style.color = 'var(--primary)';
        });

        link.addEventListener('mouseleave', () => {
          link.style.color = 'var(--text)';
        });

        listItem.appendChild(link);
        tocList.appendChild(listItem);
      });

      toc.appendChild(tocList);

      // Insert after first h1 or at beginning of content
      const firstHeading = content.querySelector('h1');
      if (firstHeading && firstHeading.nextElementSibling) {
        firstHeading.nextElementSibling.before(toc);
      } else {
        content.prepend(toc);
      }
    }
  }

  // ============================================
  // Accessibility Improvements
  // ============================================

  // Add skip to content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -100px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    z-index: 9999;
    transition: top 0.2s ease;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-100px';
  });

  document.body.prepend(skipLink);

  // Add main-content ID if not present
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }

  console.log('✨ EasyLang documentation enhancements loaded!');
});
