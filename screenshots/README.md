# Screenshots

This directory contains screenshots demonstrating the testing implementation.

## Coverage Reports (`coverage-reports/`)
Screenshots of test coverage reports:
- `server-coverage.png` - Server-side test coverage report
- `client-coverage.png` - Client-side test coverage report

## How to Take Coverage Screenshots

### Coverage Reports
1. Run tests with coverage:
   ```bash
   # Server coverage
   cd server && pnpm test -- --coverage
   
   # Client coverage
   cd client && pnpm test -- --coverage
   ```
2. Open the generated HTML coverage reports in your browser:
   - Server: `server/coverage/index.html`
   - Client: `client/coverage/index.html`
3. Take full-page screenshots of the coverage summary
4. Save in `screenshots/coverage-reports/` directory
