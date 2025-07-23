# Fortitude Loan Management System

A comprehensive Progressive Web Application (PWA) for managing informal loans, borrowers, payments, and financial reporting. Built with React, TypeScript, and Tailwind CSS, featuring local storage for data persistence and cross-device compatibility.

## 🚀 Overview

Fortitude is a modern loan management system designed for small-scale lending operations. It provides a complete solution for tracking borrowers, managing loans with flexible interest calculations, recording payments, and generating detailed financial reports.

### Key Features

- **👥 Borrower Management**: Complete borrower profiles with contact information and loan history
- **💰 Flexible Loan System**: Support for simple and annual interest calculations with customizable durations
- **📊 Payment Tracking**: Record EMI, partial, and full payments with automatic loan balance updates
- **📈 Financial Reporting**: Comprehensive reports with PDF/Excel export capabilities
- **🔐 Simple Authentication**: Local storage-based user accounts with automatic signup
- **📱 Progressive Web App**: Installable on mobile devices with offline capabilities
- **💾 Data Portability**: Export/import functionality for data backup and transfer

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API with useReducer
- **Data Storage**: Browser localStorage with structured data models
- **Authentication**: Local token-based authentication
- **PWA Features**: Service Worker for offline functionality
- **Build Tool**: Vite for fast development and optimized builds
- **Deployment**: Netlify with automatic builds

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── borrowers/      # Borrower-specific components
│   ├── loans/          # Loan management components
│   ├── payments/       # Payment tracking components
│   ├── admin/          # Administrative components
│   └── layout/         # Layout and navigation components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── AppContext.tsx  # Application state management
├── pages/              # Main application pages
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Overview and statistics
│   ├── Borrowers.tsx   # Borrower management
│   ├── Loans.tsx       # Loan portfolio management
│   ├── Payments.tsx    # Payment tracking
│   └── Reports.tsx     # Financial reporting
├── services/           # Business logic and data services
│   ├── api.ts          # Main API service layer
│   ├── storage.ts      # localStorage abstraction
│   ├── exportService.ts # PDF/Excel export functionality
│   └── sampleData.ts   # Data initialization
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and PWA helpers
└── lib/                # External library configurations
```

## 🔧 Core Functionality

### 1. Authentication System

**Local Storage Based Authentication**
- Simple username/password authentication
- Automatic account creation on first login
- Session management with JWT-like tokens
- No external dependencies or email verification required

```typescript
// Example login flow
const login = async (username: string, password: string) => {
  // Check if user exists in localStorage
  // If not, create new user automatically
  // Generate session token and store user data
};
```

### 2. Borrower Management

**Complete Borrower Profiles**
- Personal information (name, phone, address, email)
- Joining date and status tracking
- Automatic loan statistics calculation
- Loan history and payment tracking

**Features:**
- Add/edit/delete borrowers
- Search and filter functionality
- Borrower details with complete loan history
- Automatic statistics updates

### 3. Loan Management System

**Flexible Loan Calculations**

The system supports two interest calculation methods:

**Simple Interest:**
```
Total Amount = Principal + (Principal × Interest Rate)
EMI = Total Amount ÷ Number of Periods
```

**Annual Interest:**
```
Total Amount = Principal + (Principal × Interest Rate × Time in Years)
EMI = Total Amount ÷ Number of Periods
```

**Loan Features:**
- Customizable durations (weeks or months)
- Multiple loan statuses (active, completed, overdue, defaulted)
- Automatic EMI calculations
- Due date tracking with overdue detection
- Loan modification and status updates

### 4. Payment Processing

**Payment Types:**
- **EMI Payments**: Regular installment payments
- **Partial Payments**: Any amount less than full outstanding
- **Full Payments**: Complete loan settlement

**Automatic Updates:**
- Loan balance recalculation
- Borrower statistics updates
- Account balance adjustments
- Payment history tracking

### 5. Financial Reporting

**Report Types:**
- Portfolio summary with key metrics
- Outstanding loans analysis
- Past due loans with overdue calculations
- Borrower-wise financial breakdown
- Payment history and trends

**Export Options:**
- PDF reports with professional formatting
- Excel spreadsheets with multiple worksheets
- Data sharing capabilities for mobile devices

### 6. Account Balance Management

**Centralized Balance Tracking:**
- Available balance for new loans
- Total disbursed amount tracking
- Total collected payments
- Outstanding amount calculations
- Transaction history with detailed logs

## 💾 Data Models

### Core Entities

```typescript
interface Borrower {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  totalLoans: number;
  totalOutstanding: number;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'annual';
  duration: { value: number; unit: 'weeks' | 'months' };
  startDate: string;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  emi: number;
  totalInterest: number;
  totalAmount: number;
  outstandingAmount: number;
  paidAmount: number;
  // ... additional fields
}

interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  paymentDate: string;
  paymentType: 'emi' | 'partial' | 'full';
  description?: string;
  createdAt: string;
}
```

### Data Storage Strategy

**localStorage Structure:**
```javascript
// Storage keys with 'fortitude_' prefix
fortitude_users: User[]
fortitude_borrowers: Borrower[]
fortitude_loans: Loan[]
fortitude_payments: Payment[]
fortitude_accountBalance: AccountBalance
fortitude_balanceTransactions: BalanceTransaction[]
```

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with localStorage support
- Git for version control

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd fortitude-loan-management
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application:**
Open `http://localhost:5173` in your browser

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📱 Progressive Web App Features

### PWA Capabilities

- **Installable**: Can be installed on mobile devices and desktops
- **Offline Support**: Service Worker caches essential resources
- **Responsive Design**: Optimized for all screen sizes
- **App-like Experience**: Full-screen mode and native app feel

### Service Worker Features

```javascript
// Caching strategy
- Cache essential app resources
- Offline fallback for core functionality
- Background sync for future enhancements
```

### Installation Process

1. Visit the deployed app URL
2. Browser will show "Install App" prompt
3. Click install to add to home screen
4. App works offline with cached data

## 🌐 Deployment

### Current Deployment: Netlify

The application is configured for automatic deployment on Netlify with the following setup:

**Build Configuration:**
```javascript
// netlify.toml (implicit)
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

**Deployment Process:**

1. **Automatic Deployment:**
```bash
# Triggered automatically on code changes
npm run build        # Vite builds optimized production bundle
# Netlify deploys to CDN automatically
```

2. **Manual Deployment:**
```bash
# Build locally
npm run build

# Deploy dist/ folder to any static hosting service
```

### Deployment Checklist

- ✅ Static site generation with Vite
- ✅ PWA manifest and service worker
- ✅ Responsive design for all devices
- ✅ localStorage data persistence
- ✅ Error boundaries and fallbacks
- ✅ SEO meta tags and descriptions

### Environment Configuration

**No Environment Variables Required:**
- Pure client-side application
- No external API dependencies
- All data stored in browser localStorage
- No build-time configuration needed

## 🔒 Security Considerations

### Data Security

**Local Storage Security:**
- Data encrypted in browser's localStorage
- Session tokens with expiration
- No sensitive data transmitted over network
- User data isolated per browser/device

**Authentication Security:**
- Simple token-based authentication
- Automatic session expiration
- No password storage in plain text
- Local-only user verification

### Privacy Features

- **No External Data Transmission**: All data stays in user's browser
- **No Analytics or Tracking**: Complete privacy by design
- **Data Portability**: Users can export their data anytime
- **Data Control**: Users have complete control over their data

## 📊 Performance Optimization

### Build Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and resource optimization
- **Bundle Analysis**: Optimized chunk sizes

### Runtime Performance

- **Virtual Scrolling**: Efficient rendering of large lists
- **Memoization**: React.memo and useMemo optimizations
- **Lazy Loading**: Components loaded on demand
- **Efficient State Management**: Optimized Context usage

## 🧪 Testing Strategy

### Testing Approach

**Manual Testing Areas:**
- User authentication flows
- CRUD operations for all entities
- Calculation accuracy for loans and payments
- Report generation and export functionality
- PWA installation and offline capabilities
- Cross-browser compatibility

**Recommended Testing:**
```bash
# Unit tests for business logic
npm test

# E2E testing with Playwright/Cypress
npm run test:e2e

# Performance testing
npm run test:performance
```

## 🔄 Data Migration and Backup

### Export/Import Functionality

**Data Export:**
```javascript
// Exports all application data as JSON
const exportData = () => {
  return {
    borrowers: getAllBorrowers(),
    loans: getAllLoans(),
    payments: getAllPayments(),
    accountBalance: getAccountBalance(),
    exportDate: new Date().toISOString()
  };
};
```

**Data Import:**
```javascript
// Imports data from JSON backup
const importData = (jsonData) => {
  // Validates and imports all data types
  // Maintains data integrity and relationships
};
```

### Backup Strategy

1. **Regular Exports**: Users should export data regularly
2. **Browser Backup**: Data persists in localStorage
3. **Cross-Device Transfer**: Export from one device, import to another
4. **Version Control**: JSON format allows version tracking

## 🚨 Troubleshooting

### Common Issues

**Data Not Persisting:**
- Check browser localStorage quota
- Verify localStorage is enabled
- Clear browser cache if corrupted

**Performance Issues:**
- Large datasets may slow down the app
- Consider data archiving for old records
- Use browser dev tools to identify bottlenecks

**PWA Installation Issues:**
- Ensure HTTPS connection
- Check service worker registration
- Verify manifest.json configuration

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem('fortitude_debug', 'true');

// View all stored data
console.log('All Data:', storageService.exportData());
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow existing TypeScript and React patterns
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Utilize Context API for global state
4. **Styling**: Use Tailwind CSS with shadcn/ui components
5. **Type Safety**: Maintain strict TypeScript typing

### Adding New Features

1. **Define Types**: Add TypeScript interfaces in `src/types/`
2. **Create Services**: Add business logic in `src/services/`
3. **Build Components**: Create reusable components
4. **Update Context**: Modify state management as needed
5. **Add Routes**: Update routing in `App.tsx`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the code documentation
3. Test with sample data to isolate issues
4. Use browser developer tools for debugging

---

**Fortitude Loan Management System** - Empowering small-scale lending with modern technology.