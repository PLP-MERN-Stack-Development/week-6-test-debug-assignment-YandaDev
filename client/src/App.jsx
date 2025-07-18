import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PostProvider } from './context/PostContext';
import { CategoriesProvider } from './context/CategoriesContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CreateEditPostPage from './pages/CreateEditPostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor, { usePerformanceMonitor } from './components/PerformanceMonitor';
import logger from './utils/logger';
import './App.css';

function App() {
  // Monitor app performance
  usePerformanceMonitor('App');

  // Log app initialization
  React.useEffect(() => {
    logger.info('Application initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CategoriesProvider>
            <PostProvider>
              <Layout>
                <ErrorBoundary fallback={<div className="error-fallback">Something went wrong with the page content.</div>}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/post/:id" element={<PostPage />} />
                    <Route path="/posts/:id" element={<PostPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/create"
                      element={
                        <ProtectedRoute>
                          <CreateEditPostPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit/:id"
                      element={
                        <ProtectedRoute>
                          <CreateEditPostPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ErrorBoundary>
              </Layout>
              <PerformanceMonitor />
            </PostProvider>
          </CategoriesProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;