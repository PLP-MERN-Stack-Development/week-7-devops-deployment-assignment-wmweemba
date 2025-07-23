export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Borrower {
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

export interface LoanDuration {
  value: number;
  unit: 'weeks' | 'months';
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'annual';
  duration: LoanDuration;
  termInMonths: number; // Keep for backward compatibility
  startDate: string;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  emi: number;
  totalInterest: number;
  totalAmount: number;
  outstandingAmount: number;
  paidAmount: number;
  disbursementDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  paymentDate: string;
  paymentType: 'emi' | 'partial' | 'full';
  description?: string;
  createdAt: string;
}

export interface AccountBalance {
  id: string;
  availableBalance: number;
  totalDisbursed: number;
  totalCollected: number;
  totalOutstanding: number;
  lastUpdated: string;
}

export interface BalanceTransaction {
  id: string;
  type: 'deposit' | 'disbursement' | 'collection';
  amount: number;
  description: string;
  relatedLoanId?: string;
  relatedPaymentId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface RepaymentSchedule {
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  outstandingBalance: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AppState {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  accountBalance: AccountBalance | null;
  balanceTransactions: BalanceTransaction[];
  loading: boolean;
  error: string | null;
}

export interface ReportData {
  outstandingLoans: Loan[];
  pastDueLoans: Loan[];
  borrowersReport: {
    borrower: Borrower;
    loans: Loan[];
    totalBorrowed: number;
    totalPaid: number;
    currentOutstanding: number;
  }[];
  portfolioSummary: {
    totalBorrowers: number;
    totalLoansIssued: number;
    totalAmountDisbursed: number;
    totalAmountCollected: number;
    totalOutstanding: number;
    averageLoanSize: number;
    defaultRate: number;
  };
}