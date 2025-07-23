# Changelog

## 23-07-2025

- Initialized backend project structure in `server/src/` with:
  - `app.ts` (Express app setup)
  - `server.ts` (MongoDB connection and server entry point)
  - `models/`, `controllers/`, `routes/`, `middleware/`, `utils/` folders
- Added `.env` template and configured environment variables for MongoDB Atlas, JWT secret, and server port
- Created User model (`models/User.ts`) with TypeScript typing and Mongoose schema
- Implemented admin user seeding script (`utils/seedAdmin.ts`) and seeded admin account (`admin`/`lmsadmin`)
- Verified MongoDB Atlas connection and admin user creation
- Created Borrower model (`models/Borrower.ts`) with all required fields and TypeScript typing
- Implemented Borrower controller (`controllers/borrowerController.ts`) with CRUD operations
- Created Borrower routes (`routes/borrowerRoutes.ts`) and registered them in `app.ts` under `/api/borrowers`
- Removed admin seeding logic from `server.ts` after initial seeding
- Created Loan model (`models/Loan.ts`) with all relevant fields and TypeScript typing
- Added authentication controller (`controllers/authController.ts`) with register and login endpoints using bcrypt and JWT
- Created authentication routes (`routes/authRoutes.ts`) and registered them in `app.ts` under `/api/auth`
- Updated User model (`models/User.ts`) to include a `role` property (`'admin' | 'user'`) in both the TypeScript interface and Mongoose schema
- Fixed type errors related to the `role` property in authentication logic
- Installed `@types/node` in the client project to resolve missing type declarations for Node.js modules
- Added JWT authentication middleware (`middleware/authMiddleware.ts`) to protect sensitive routes
- Updated `loanRoutes.ts` and `borrowerRoutes.ts` to use `authenticateJWT` middleware for route protection
- Fixed import and usage of `getAllBorrowers` in `borrowerRoutes.ts` to match the controller export
- Added Payment model (`models/Payment.ts`) with fields for loanId, borrowerId, amount, paymentDate, method, note, and timestamps.
- Implemented Payment controller (`controllers/paymentController.ts`) with CRUD operations:
  - Creating a payment updates the corresponding loan's paidAmount, outstandingAmount, and status.
  - Integrated request validation using `express-validator` for create and update operations.
- Created Payment routes (`routes/paymentRoutes.ts`) with JWT protection and validation middleware.
- Registered payment routes in `app.ts` under `/api/payments`