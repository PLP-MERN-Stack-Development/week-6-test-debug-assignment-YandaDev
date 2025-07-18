describe('Posts CRUD Operations', () => {
  let testData;

  beforeEach(() => {
    // Clear the database and setup test data
    cy.clearDatabase();
    cy.setupTestData().then((data) => {
      testData = data;
    });
  });

  describe('View Posts', () => {
    it('should display posts on the home page', () => {
      // Create some test posts
      cy.createPost('First Test Post', 'This is the first test post content', testData.categoryId, testData.token);
      cy.createPost('Second Test Post', 'This is the second test post content', testData.categoryId, testData.token);
      
      cy.visit('/');
      
      // Should display posts
      cy.get('[data-cy=post-list]').should('be.visible');
      cy.contains('First Test Post').should('be.visible');
      cy.contains('Second Test Post').should('be.visible');
    });

    it('should paginate posts when there are many', () => {
      // Create more than 10 posts
      for (let i = 1; i <= 15; i++) {
        cy.createPost(`Test Post ${i}`, `Content for post ${i}`, testData.categoryId, testData.token);
      }
      
      cy.visit('/');
      
      // Should show pagination
      cy.get('[data-cy=pagination]').should('be.visible');
      cy.get('[data-cy=next-page]').should('be.visible');
      
      // Click next page
      cy.get('[data-cy=next-page]').click();
      
      // Should navigate to page 2
      cy.url().should('include', 'page=2');
    });

    it('should filter posts by category', () => {
      // Create posts in different categories
      cy.createCategory('Tech', 'Technology posts', testData.token).then((techCategory) => {
        cy.createPost('Tech Post', 'Technology content', techCategory.body._id, testData.token);
      });
      
      cy.createPost('General Post', 'General content', testData.categoryId, testData.token);
      
      cy.visit('/');
      
      // Filter by category
      cy.get('[data-cy=category-filter]').select('Tech');
      
      // Should only show tech posts
      cy.contains('Tech Post').should('be.visible');
      cy.contains('General Post').should('not.exist');
    });

    it('should search posts by title and content', () => {
      cy.createPost('JavaScript Tutorial', 'Learn JavaScript basics', testData.categoryId, testData.token);
      cy.createPost('Python Guide', 'Python programming guide', testData.categoryId, testData.token);
      
      cy.visit('/');
      
      // Search for JavaScript
      cy.get('[data-cy=search-input]').type('JavaScript');
      cy.get('[data-cy=search-button]').click();
      
      // Should only show JavaScript post
      cy.contains('JavaScript Tutorial').should('be.visible');
      cy.contains('Python Guide').should('not.exist');
    });
  });

  describe('View Single Post', () => {
    it('should display post details when clicking on a post', () => {
      cy.createPost('Detailed Post', 'This post has detailed content', testData.categoryId, testData.token)
        .then((response) => {
          const postId = response.body._id;
          
          cy.visit('/');
          
          // Click on the post
          cy.contains('Detailed Post').click();
          
          // Should navigate to post detail page
          cy.url().should('include', `/posts/${postId}`);
          cy.contains('Detailed Post').should('be.visible');
          cy.contains('This post has detailed content').should('be.visible');
        });
    });

    it('should show 404 for non-existent post', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      cy.visit(`/posts/${fakeId}`);
      
      cy.contains('Post not found').should('be.visible');
      cy.get('[data-cy=back-home-link]').should('be.visible');
    });
  });

  describe('Create Post', () => {
    beforeEach(() => {
      // Login the test user
      cy.loginViaUI(testData.user.email, testData.user.password);
    });

    it('should create a new post successfully', () => {
      cy.visit('/create-post');
      
      // Fill out the form
      cy.get('[data-cy=title-input]').type('New E2E Test Post');
      cy.get('[data-cy=content-textarea]').type('This is the content of the new post created via E2E test');
      cy.get('[data-cy=category-select]').select('Test Category');
      
      // Submit the form
      cy.get('[data-cy=create-post-button]').click();
      
      // Should redirect to the new post
      cy.url().should('include', '/posts/');
      cy.contains('New E2E Test Post').should('be.visible');
      cy.contains('This is the content of the new post').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/create-post');
      
      // Try to submit empty form
      cy.get('[data-cy=create-post-button]').click();
      
      // Should show validation errors
      cy.contains('Title is required').should('be.visible');
      cy.contains('Content is required').should('be.visible');
      cy.contains('Category is required').should('be.visible');
    });

    it('should upload featured image for post', () => {
      cy.visit('/create-post');
      
      cy.get('[data-cy=title-input]').type('Post with Image');
      cy.get('[data-cy=content-textarea]').type('This post has a featured image');
      cy.get('[data-cy=category-select]').select('Test Category');
      
      // Upload an image (assuming there's an image file in fixtures)
      cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      
      cy.get('[data-cy=create-post-button]').click();
      
      // Should display the image
      cy.get('[data-cy=featured-image]').should('be.visible');
    });
  });

  describe('Edit Post', () => {
    let postId;

    beforeEach(() => {
      // Login and create a post to edit
      cy.loginViaUI(testData.user.email, testData.user.password);
      cy.createPost('Post to Edit', 'Original content', testData.categoryId, testData.token)
        .then((response) => {
          postId = response.body._id;
        });
    });

    it('should edit post successfully', () => {
      cy.visit(`/edit-post/${postId}`);
      
      // Update the content
      cy.get('[data-cy=title-input]').clear().type('Updated Post Title');
      cy.get('[data-cy=content-textarea]').clear().type('Updated post content');
      
      // Submit the changes
      cy.get('[data-cy=update-post-button]').click();
      
      // Should redirect to the updated post
      cy.url().should('include', `/posts/${postId}`);
      cy.contains('Updated Post Title').should('be.visible');
      cy.contains('Updated post content').should('be.visible');
    });

    it('should not allow editing posts by other users', () => {
      // Create another user and login
      cy.register('otheruser', 'other@example.com', 'password123');
      cy.loginViaUI('other@example.com', 'password123');
      
      cy.visit(`/edit-post/${postId}`);
      
      // Should show unauthorized message or redirect
      cy.contains('Not authorized').should('be.visible');
    });
  });

  describe('Delete Post', () => {
    let postId;

    beforeEach(() => {
      // Login and create a post to delete
      cy.loginViaUI(testData.user.email, testData.user.password);
      cy.createPost('Post to Delete', 'Content to be deleted', testData.categoryId, testData.token)
        .then((response) => {
          postId = response.body._id;
        });
    });

    it('should delete post successfully', () => {
      cy.visit(`/posts/${postId}`);
      
      // Click delete button
      cy.get('[data-cy=delete-post-button]').click();
      
      // Confirm deletion in modal
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', `/posts/${postId}`);
      cy.contains('Post deleted successfully').should('be.visible');
      
      // Post should not appear in the list
      cy.visit('/');
      cy.contains('Post to Delete').should('not.exist');
    });

    it('should not allow deleting posts by other users', () => {
      // Create another user and login
      cy.register('otheruser', 'other@example.com', 'password123');
      cy.loginViaUI('other@example.com', 'password123');
      
      cy.visit(`/posts/${postId}`);
      
      // Delete button should not be visible
      cy.get('[data-cy=delete-post-button]').should('not.exist');
    });
  });
});
