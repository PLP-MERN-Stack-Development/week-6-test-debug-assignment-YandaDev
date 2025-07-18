const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Category = require('../models/Category');

const router = express.Router();

// Only allow test database operations in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Clear all test data (USE WITH CAUTION - only in test environment)
router.post('/clear-database', async (req, res) => {
  if (!isTestEnvironment) {
    return res.status(403).json({ error: 'Database clearing only allowed in test environment' });
  }

  try {
    await Promise.all([
      Post.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({})
    ]);

    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Database clear error:', error);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

// Seed test data
router.post('/seed-data', async (req, res) => {
  if (!isTestEnvironment) {
    return res.status(403).json({ error: 'Database seeding only allowed in test environment' });
  }

  try {
    // Clear existing data first
    await Promise.all([
      Post.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({})
    ]);

    // Create test user
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create test categories
    const techCategory = await Category.create({
      name: 'Technology',
      description: 'Technology related posts'
    });

    const lifestyleCategory = await Category.create({
      name: 'Lifestyle',
      description: 'Lifestyle related posts'
    });

    // Create test posts
    const posts = [];
    for (let i = 1; i <= 5; i++) {
      const post = await Post.create({
        title: `Test Post ${i}`,
        content: `This is the content for test post ${i}. It contains some sample text to demonstrate the post functionality.`,
        author: testUser._id,
        category: i % 2 === 0 ? techCategory._id : lifestyleCategory._id,
        slug: `test-post-${i}`,
        featuredImage: 'default-post.jpg'
      });
      posts.push(post);
    }

    res.json({
      message: 'Test data seeded successfully',
      data: {
        user: testUser,
        categories: [techCategory, lifestyleCategory],
        posts: posts
      }
    });
  } catch (error) {
    console.error('Database seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Reset database to specific state
router.post('/reset-to-clean-state', async (req, res) => {
  if (!isTestEnvironment) {
    return res.status(403).json({ error: 'Database reset only allowed in test environment' });
  }

  try {
    // Clear all data
    await Promise.all([
      Post.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({})
    ]);

    res.json({ message: 'Database reset to clean state' });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Get database statistics (for test verification)
router.get('/stats', async (req, res) => {
  if (!isTestEnvironment) {
    return res.status(403).json({ error: 'Database stats only available in test environment' });
  }

  try {
    const stats = {
      users: await User.countDocuments(),
      posts: await Post.countDocuments(),
      categories: await Category.countDocuments()
    };

    res.json(stats);
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({ error: 'Failed to get database stats' });
  }
});

module.exports = router;
