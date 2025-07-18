import React, { useEffect, useState } from 'react';
import logger from '../utils/logger';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow components
        logger.logPerformance('Component Render Time', renderTime, {
          component: componentName,
          slow: true
        });
      }
    };
  }, [componentName]);
};

// Memory usage monitor
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        const info = {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        setMemoryInfo(info);
        
        // Log high memory usage
        if (info.usedJSHeapSize > 50) { // More than 50MB
          logger.warn('High Memory Usage', info);
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Network performance monitor
export const useNetworkMonitor = () => {
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const info = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
      
      setNetworkInfo(info);
      
      // Log slow connections
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        logger.warn('Slow Network Connection', info);
      }
      
      const handleChange = () => {
        logger.info('Network Connection Changed', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink
        });
      };
      
      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  return networkInfo;
};

// Performance dashboard component
const PerformanceDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const memoryInfo = useMemoryMonitor();
  const networkInfo = useNetworkMonitor();

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      // Listen for key combination to toggle dashboard
      const handleKeyPress = (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
          setIsVisible(!isVisible);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible]);

  useEffect(() => {
    // Collect performance data
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    setPerformanceData({
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      ttfb: timing.responseStart - timing.navigationStart,
      ...(navigation && {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.secureConnectionStart > 0 
          ? navigation.connectEnd - navigation.secureConnectionStart 
          : 0
      })
    });
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h3>Performance Dashboard</h3>
        <button onClick={() => setIsVisible(false)}>×</button>
      </div>
      
      <div className="dashboard-content">
        <div className="metric-group">
          <h4>Page Performance</h4>
          <div className="metrics">
            <div className="metric">
              <span>Page Load:</span>
              <span>{performanceData.pageLoadTime}ms</span>
            </div>
            <div className="metric">
              <span>DOM Ready:</span>
              <span>{performanceData.domReadyTime}ms</span>
            </div>
            <div className="metric">
              <span>TTFB:</span>
              <span>{performanceData.ttfb}ms</span>
            </div>
          </div>
        </div>

        {memoryInfo && (
          <div className="metric-group">
            <h4>Memory Usage</h4>
            <div className="metrics">
              <div className="metric">
                <span>Used:</span>
                <span>{memoryInfo.usedJSHeapSize}MB</span>
              </div>
              <div className="metric">
                <span>Total:</span>
                <span>{memoryInfo.totalJSHeapSize}MB</span>
              </div>
              <div className="metric">
                <span>Limit:</span>
                <span>{memoryInfo.jsHeapSizeLimit}MB</span>
              </div>
            </div>
          </div>
        )}

        {networkInfo && (
          <div className="metric-group">
            <h4>Network</h4>
            <div className="metrics">
              <div className="metric">
                <span>Type:</span>
                <span>{networkInfo.effectiveType}</span>
              </div>
              <div className="metric">
                <span>Downlink:</span>
                <span>{networkInfo.downlink}Mbps</span>
              </div>
              <div className="metric">
                <span>RTT:</span>
                <span>{networkInfo.rtt}ms</span>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <button onClick={() => logger.exportLogs()}>
            Export Logs
          </button>
          <button onClick={() => logger.clearLogs()}>
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
