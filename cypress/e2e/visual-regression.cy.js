describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Component Visual Tests', () => {
    it('should render Button component consistently', () => {
      cy.visit('/component-showcase'); // Assuming we have a component showcase page
      
      // Test different button variants
      cy.get('[data-cy=button-primary]').should('be.visible');
      cy.get('[data-cy=button-secondary]').should('be.visible');
      cy.get('[data-cy=button-danger]').should('be.visible');
      
      // Take screenshots for visual comparison
      cy.get('[data-cy=button-showcase]').screenshot('button-variants');
      
      // Test different button sizes
      cy.get('[data-cy=button-small]').should('be.visible');
      cy.get('[data-cy=button-medium]').should('be.visible');
      cy.get('[data-cy=button-large]').should('be.visible');
      
      cy.get('[data-cy=button-sizes]').screenshot('button-sizes');
    });

    it('should render PostItem component consistently', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Visual Test Post', 'This is content for visual testing with a longer description to test text wrapping and layout', testData.categoryId, testData.token);
        
        cy.visit('/');
        
        // Screenshot of post item
        cy.get('[data-cy=post-item]').first().screenshot('post-item-default');
        
        // Test hover state
        cy.get('[data-cy=post-item]').first().trigger('mouseover');
        cy.get('[data-cy=post-item]').first().screenshot('post-item-hover');
      });
    });

    it('should render Navbar component consistently', () => {
      cy.visit('/');
      
      // Test unauthenticated navbar
      cy.get('[data-cy=navbar]').screenshot('navbar-unauthenticated');
      
      // Test authenticated navbar
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      cy.get('[data-cy=navbar]').screenshot('navbar-authenticated');
      
      // Test mobile navbar (if responsive)
      cy.viewport(375, 667); // iPhone 6/7/8 size
      cy.get('[data-cy=navbar]').screenshot('navbar-mobile');
    });

    it('should render PostForm component consistently', () => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      cy.visit('/create-post');
      
      // Empty form
      cy.get('[data-cy=post-form]').screenshot('post-form-empty');
      
      // Filled form
      cy.get('[data-cy=title-input]').type('Sample Post Title');
      cy.get('[data-cy=content-textarea]').type('Sample post content with some text to show how the form looks when filled out.');
      cy.get('[data-cy=category-select]').select(0);
      
      cy.get('[data-cy=post-form]').screenshot('post-form-filled');
      
      // Form with validation errors
      cy.get('[data-cy=title-input]').clear();
      cy.get('[data-cy=create-post-button]').click();
      
      cy.get('[data-cy=post-form]').screenshot('post-form-validation-errors');
    });
  });

  describe('Layout Visual Tests', () => {
    it('should render home page layout consistently', () => {
      cy.setupTestData().then((testData) => {
        // Create sample posts for visual testing
        cy.createPost('First Visual Test Post', 'Content for the first post', testData.categoryId, testData.token);
        cy.createPost('Second Visual Test Post', 'Content for the second post', testData.categoryId, testData.token);
        cy.createPost('Third Visual Test Post', 'Content for the third post', testData.categoryId, testData.token);
        
        cy.visit('/');
        
        // Full page screenshot
        cy.screenshot('home-page-full');
        
        // Header section
        cy.get('[data-cy=header]').screenshot('home-page-header');
        
        // Posts section
        cy.get('[data-cy=posts-section]').screenshot('home-page-posts');
        
        // Footer section (if exists)
        cy.get('[data-cy=footer]').screenshot('home-page-footer');
      });
    });

    it('should render post detail page layout consistently', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Detailed Visual Test Post', 'This is a longer content for the detailed post view. It includes multiple paragraphs and various content to test the layout properly.', testData.categoryId, testData.token).then((response) => {
          const postId = response.body._id;
          
          cy.visit(`/posts/${postId}`);
          
          // Full post detail page
          cy.screenshot('post-detail-full');
          
          // Post content section
          cy.get('[data-cy=post-content]').screenshot('post-detail-content');
          
          // Post actions section
          cy.get('[data-cy=post-actions]').screenshot('post-detail-actions');
        });
      });
    });

    it('should render login page layout consistently', () => {
      cy.visit('/login');
      
      // Full login page
      cy.screenshot('login-page-full');
      
      // Login form
      cy.get('[data-cy=login-form]').screenshot('login-form');
      
      // Test form with validation errors
      cy.get('[data-cy=login-button]').click();
      cy.screenshot('login-page-validation-errors');
    });

    it('should render registration page layout consistently', () => {
      cy.visit('/register');
      
      // Full registration page
      cy.screenshot('register-page-full');
      
      // Registration form
      cy.get('[data-cy=register-form]').screenshot('register-form');
    });
  });

  describe('Responsive Design Tests', () => {
    beforeEach(() => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Responsive Test Post', 'Content for responsive testing', testData.categoryId, testData.token);
      });
    });

    it('should render consistently on desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      
      cy.screenshot('desktop-1920x1080');
      
      cy.viewport(1366, 768);
      cy.visit('/');
      
      cy.screenshot('desktop-1366x768');
    });

    it('should render consistently on tablet', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/');
      
      cy.screenshot('tablet-768x1024');
      
      cy.viewport(1024, 768); // iPad landscape
      cy.visit('/');
      
      cy.screenshot('tablet-1024x768');
    });

    it('should render consistently on mobile', () => {
      cy.viewport(375, 667); // iPhone 6/7/8
      cy.visit('/');
      
      cy.screenshot('mobile-375x667');
      
      cy.viewport(414, 896); // iPhone XR
      cy.visit('/');
      
      cy.screenshot('mobile-414x896');
      
      cy.viewport(360, 640); // Android
      cy.visit('/');
      
      cy.screenshot('mobile-360x640');
    });
  });

  describe('Dark Mode Visual Tests', () => {
    it('should render consistently in light mode', () => {
      // Ensure light mode is active
      cy.window().then((win) => {
        win.localStorage.setItem('theme', 'light');
      });
      
      cy.visit('/');
      cy.screenshot('light-mode-home');
      
      cy.visit('/login');
      cy.screenshot('light-mode-login');
    });

    it('should render consistently in dark mode', () => {
      // Switch to dark mode
      cy.window().then((win) => {
        win.localStorage.setItem('theme', 'dark');
      });
      
      cy.visit('/');
      cy.screenshot('dark-mode-home');
      
      cy.visit('/login');
      cy.screenshot('dark-mode-login');
    });
  });

  describe('Loading State Visual Tests', () => {
    it('should render loading states consistently', () => {
      // Intercept API calls to control loading states
      cy.intercept('GET', '/api/posts', (req) => {
        req.reply({ delay: 2000, fixture: 'posts.json' });
      }).as('slowPosts');
      
      cy.visit('/');
      
      // Capture loading state
      cy.get('[data-cy=loading-spinner]').should('be.visible');
      cy.screenshot('loading-state-posts');
      
      cy.wait('@slowPosts');
    });

    it('should render empty states consistently', () => {
      cy.visit('/');
      
      // No posts state
      cy.intercept('GET', '/api/posts', { body: [] }).as('noPosts');
      cy.reload();
      cy.wait('@noPosts');
      
      cy.screenshot('empty-state-no-posts');
    });
  });

  describe('Error State Visual Tests', () => {
    it('should render error states consistently', () => {
      // Network error state
      cy.intercept('GET', '/api/posts', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/');
      cy.wait('@networkError');
      
      cy.screenshot('error-state-network');
      
      // 404 error state
      cy.visit('/posts/nonexistent');
      cy.screenshot('error-state-404');
    });

    it('should render form validation errors consistently', () => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      cy.visit('/create-post');
      
      // Submit form with errors
      cy.get('[data-cy=create-post-button]').click();
      
      cy.screenshot('form-validation-errors');
    });
  });

  describe('Animation and Transition Tests', () => {
    it('should capture transition states', () => {
      cy.visit('/');
      
      // Test modal opening animation
      cy.get('[data-cy=create-post-link]').click();
      
      // Capture transition state
      cy.wait(100); // Mid-transition
      cy.screenshot('page-transition-mid');
      
      cy.wait(500); // Complete transition
      cy.screenshot('page-transition-complete');
    });

    it('should test hover animations', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Hover Test Post', 'Content', testData.categoryId, testData.token);
        
        cy.visit('/');
        
        // Before hover
        cy.get('[data-cy=post-item]').first().screenshot('post-item-before-hover');
        
        // During hover
        cy.get('[data-cy=post-item]').first().trigger('mouseover');
        cy.wait(200); // Allow animation
        cy.get('[data-cy=post-item]').first().screenshot('post-item-during-hover');
        
        // After hover
        cy.get('[data-cy=post-item]').first().trigger('mouseout');
        cy.wait(200); // Allow animation
        cy.get('[data-cy=post-item]').first().screenshot('post-item-after-hover');
      });
    });
  });
});
