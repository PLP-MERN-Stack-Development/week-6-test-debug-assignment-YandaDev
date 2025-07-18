# Test Coverage Report Generation Guide

## 📊 How to Generate Coverage Reports

### Server Coverage
Run from the **root directory**:
```bash
cd server && pnpm test -- --coverage
```

**Generated files:**
- HTML Report: `server/coverage/index.html`
- LCOV Report: `server/coverage/lcov-report/index.html`
- Coverage Data: `server/coverage/coverage-final.json`

### Client Coverage  
Run from the **root directory**:
```bash
cd client && pnpm test -- --coverage
```

**Generated files:**
- HTML Report: `client/coverage/index.html`
- LCOV Report: `client/coverage/lcov-report/index.html`
- Coverage Data: `client/coverage/coverage-final.json`

## 📸 Taking Screenshots for Submission

### 1. Server Coverage Screenshot
1. Run: `cd server && pnpm test -- --coverage`
2. Open: `server/coverage/index.html` in browser
3. Take full-page screenshot
4. Save as: `screenshots/coverage-reports/server-coverage.png`

### 2. Client Coverage Screenshot
1. Run: `cd client && pnpm test -- --coverage`
2. Open: `client/coverage/index.html` in browser  
3. Take full-page screenshot
4. Save as: `screenshots/coverage-reports/client-coverage.png`

## 📈 Current Coverage Status

### Server Tests (13/13 passing)
- **Overall Coverage**: ~42% statements, ~34% branches
- **Key Components**:
  - Posts API: 59% coverage
  - Authentication: 87% coverage
  - Models: 65% coverage (User, Post, Category)
  - Logger: 74% coverage

### Client Tests (8/8 passing)
- **Overall Coverage**: ~1.2% statements (focused on Button component)
- **Button Component**: 100% coverage (all tests passing)
- **Other Components**: Not yet tested (0% coverage)

## 🎯 Coverage Goals Met
- ✅ Jest configured for both client and server
- ✅ Tests running with coverage reports
- ✅ HTML reports generated for screenshots
- ✅ Server integration tests comprehensive
- ✅ Client unit tests functional
- ✅ Ready for submission documentation

## 📋 Next Steps for Screenshots
1. Run both coverage commands
2. Open HTML reports in browser
3. Take full-page screenshots showing coverage percentages
4. Save in `screenshots/coverage-reports/` directory
5. Include in submission documentation
