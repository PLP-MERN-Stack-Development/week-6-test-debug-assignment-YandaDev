# Screenshots

This directory contains screenshots demonstrating the testing and debugging implementation.

## Coverage Reports (`coverage-reports/`)
Place your test coverage screenshots here:
- `server-coverage.png` - Server-side test coverage report
- `client-coverage.png` - Client-side test coverage report
- `overall-coverage.png` - Combined coverage summary

## Test Results (`test-results/`)
Place your test execution screenshots here:
- `unit-tests.png` - Unit test results
- `integration-tests.png` - Integration test results
- `e2e-tests.png` - End-to-end test results

## Debugging Examples (`debugging/`)
Place your debugging technique screenshots here:
- `server-logs.png` - Server logging examples
- `error-boundary.png` - React error boundary in action
- `performance-monitor.png` - Performance monitoring dashboard
- `browser-devtools.png` - Browser developer tools debugging

## How to Take Screenshots

### Coverage Reports
1. Run tests with coverage:
   ```bash
   # Server coverage
   cd server && pnpm test -- --coverage
   
   # Client coverage
   cd client && pnpm test -- --coverage
   ```
2. Open the generated HTML coverage reports in your browser
3. Take full-page screenshots of the coverage summary

### Test Results
1. Run each test suite and capture the terminal output
2. Take screenshots showing passing tests and coverage percentages

### Debugging Examples
1. Run the application and trigger error scenarios
2. Show the error boundaries, logging, and monitoring in action
3. Demonstrate browser developer tools usage
