import { Borrower, Loan, Payment, User, AccountBalance, BalanceTransaction, ReportData, LoanDuration } from '@/types';
import { storageService } from './storage';

// API service using localStorage for all operations
class ApiService {
  constructor() {
    console.log('Using localStorage for all data storage.');
    this.initializeData();
  }

  private initializeData() {
    const borrowers = storageService.get<Borrower[]>('borrowers');
    if (!borrowers) {
      storageService.set('borrowers', []);
      storageService.set('loans', []);
      storageService.set('payments', []);
      storageService.set('accountBalance', {
        id: '1',
        availableBalance: 0,
        totalDisbursed: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        lastUpdated: new Date().toISOString()
      });
      storageService.set('balanceTransactions', []);
      storageService.set('users', []);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Authentication
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing users
    const users = storageService.get<User[]>('users') || [];
    
    // Try to find existing user
    let user = users.find(u => u.username === username && u.email === password);
    
    if (!user) {
      // Create new user if doesn't exist
      user = {
        id: this.generateId(),
        username: username,
        email: password, // Using password field as email for simplicity
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      users.push(user);
      storageService.set('users', users);
    }
    
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
    
    storageService.set('user', user);
    storageService.set('token', token);
    
    return { user, token };
  }

  async logout(): Promise<void> {
    storageService.remove('user');
    storageService.remove('token');
  }

  // Borrowers
  async getBorrowers(): Promise<Borrower[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return storageService.get<Borrower[]>('borrowers') || [];
  }

  async createBorrower(borrower: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>): Promise<Borrower> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newBorrower: Borrower = {
      ...borrower,
      id: this.generateId(),
      totalLoans: 0,
      totalOutstanding: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const borrowers = await this.getBorrowers();
    borrowers.push(newBorrower);
    storageService.set('borrowers', borrowers);
    
    return newBorrower;
  }

  async updateBorrower(id: string, updates: Partial<Borrower>): Promise<Borrower> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const borrowers = await this.getBorrowers();
    const index = borrowers.findIndex(b => b.id === id);
    
    if (index === -1) throw new Error('Borrower not found');
    
    borrowers[index] = { ...borrowers[index], ...updates, updatedAt: new Date().toISOString() };
    storageService.set('borrowers', borrowers);
    
    return borrowers[index];
  }

  async deleteBorrower(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all related data
    const borrowers = await this.getBorrowers();
    const loans = await this.getLoans();
    const payments = await this.getPayments();
    
    // Find borrower's loans
    const borrowerLoans = loans.filter(l => l.borrowerId === id);
    const borrowerLoanIds = borrowerLoans.map(l => l.id);
    
    // Find borrower's payments
    const borrowerPayments = payments.filter(p => p.borrowerId === id);
    
    // Calculate refund amount for active loans (if any)
    const activeLoans = borrowerLoans.filter(l => l.status === 'active');
    let refundAmount = 0;
    
    for (const loan of activeLoans) {
      refundAmount += loan.principal - loan.paidAmount;
    }
    
    // Remove borrower
    const filteredBorrowers = borrowers.filter(b => b.id !== id);
    storageService.set('borrowers', filteredBorrowers);
    
    // Remove borrower's loans
    const filteredLoans = loans.filter(l => l.borrowerId !== id);
    storageService.set('loans', filteredLoans);
    
    // Remove borrower's payments
    const filteredPayments = payments.filter(p => p.borrowerId !== id);
    storageService.set('payments', filteredPayments);
    
    // Update account balance if there were active loans
    if (refundAmount > 0) {
      const currentBalance = await this.getAccountBalance();
      const newBalance: AccountBalance = {
        ...currentBalance,
        availableBalance: currentBalance.availableBalance + refundAmount,
        totalDisbursed: currentBalance.totalDisbursed - refundAmount,
        totalOutstanding: Math.max(0, currentBalance.totalOutstanding - refundAmount),
        lastUpdated: new Date().toISOString()
      };
      storageService.set('accountBalance', newBalance);
      
      // Record balance transaction
      await this.recordBalanceTransaction(
        'deposit', 
        refundAmount, 
        `Refund from deleted borrower: ${borrowers.find(b => b.id === id)?.name || 'Unknown'}`,
        undefined,
        undefined,
        newBalance.availableBalance
      );
    }
    
    // Update account balance for removed collections
    const totalCollectedFromBorrower = borrowerPayments.reduce((sum, p) => sum + p.amount, 0);
    if (totalCollectedFromBorrower > 0) {
      const currentBalance = await this.getAccountBalance();
      const newBalance: AccountBalance = {
        ...currentBalance,
        totalCollected: Math.max(0, currentBalance.totalCollected - totalCollectedFromBorrower),
        lastUpdated: new Date().toISOString()
      };
      storageService.set('accountBalance', newBalance);
    }
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return storageService.get<Loan[]>('loans') || [];
  }

  async createLoan(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>): Promise<Loan> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loanCalculations = this.calculateLoanDetails(
      loan.principal, 
      loan.interestRate, 
      loan.interestType || 'simple',
      loan.duration || { value: loan.termInMonths, unit: 'months' }
    );
    
    const newLoan: Loan = {
      ...loan,
      id: this.generateId(),
      ...loanCalculations,
      outstandingAmount: loanCalculations.totalAmount,
      paidAmount: 0,
      disbursementDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const loans = await this.getLoans();
    loans.push(newLoan);
    storageService.set('loans', loans);
    
    // Update borrower's loan count and outstanding amount
    await this.updateBorrowerStats(loan.borrowerId);
    
    // Update account balance for disbursement
    await this.updateAccountBalanceForDisbursement(newLoan.principal, newLoan.id);
    
    return newLoan;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loans = await this.getLoans();
    const index = loans.findIndex(l => l.id === id);
    
    if (index === -1) throw new Error('Loan not found');
    
    // Recalculate loan details if key parameters changed
    let calculatedUpdates = { ...updates };
    if (updates.principal || updates.interestRate || updates.interestType || updates.duration) {
      const currentLoan = loans[index];
      const principal = updates.principal || currentLoan.principal;
      const interestRate = updates.interestRate || currentLoan.interestRate;
      const interestType = updates.interestType || currentLoan.interestType || 'simple';
      const duration = updates.duration || currentLoan.duration || { value: currentLoan.termInMonths, unit: 'months' };
      
      const loanCalculations = this.calculateLoanDetails(principal, interestRate, interestType, duration);
      calculatedUpdates = { ...calculatedUpdates, ...loanCalculations };
    }
    
    loans[index] = { ...loans[index], ...calculatedUpdates, updatedAt: new Date().toISOString() };
    storageService.set('loans', loans);
    
    return loans[index];
  }

  async deleteLoan(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loans = await this.getLoans();
    const payments = await this.getPayments();
    const loan = loans.find(l => l.id === id);
    
    if (!loan) throw new Error('Loan not found');
    
    // Find all payments for this loan
    const loanPayments = payments.filter(p => p.loanId === id);
    const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Remove the loan
    const filteredLoans = loans.filter(l => l.id !== id);
    storageService.set('loans', filteredLoans);
    
    // Remove all payments for this loan
    const filteredPayments = payments.filter(p => p.loanId !== id);
    storageService.set('payments', filteredPayments);
    
    // Update borrower stats
    await this.updateBorrowerStats(loan.borrowerId);
    
    // Update account balance
    const currentBalance = await this.getAccountBalance();
    const newBalance: AccountBalance = {
      ...currentBalance,
      availableBalance: currentBalance.availableBalance + loan.principal - totalPaid,
      totalDisbursed: currentBalance.totalDisbursed - loan.principal,
      totalCollected: Math.max(0, currentBalance.totalCollected - totalPaid),
      totalOutstanding: Math.max(0, currentBalance.totalOutstanding - loan.outstandingAmount),
      lastUpdated: new Date().toISOString()
    };
    storageService.set('accountBalance', newBalance);
    
    // Record balance transaction
    const netAmount = loan.principal - totalPaid;
    if (netAmount !== 0) {
      await this.recordBalanceTransaction(
        netAmount > 0 ? 'deposit' : 'disbursement',
        Math.abs(netAmount),
        `Loan deletion adjustment for ${loan.borrowerName}`,
        undefined,
        undefined,
        newBalance.availableBalance
      );
    }
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return storageService.get<Payment[]>('payments') || [];
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPayment: Payment = {
      ...payment,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    const payments = await this.getPayments();
    payments.push(newPayment);
    storageService.set('payments', payments);
    
    // Update loan's outstanding amount
    await this.updateLoanPayment(payment.loanId, payment.amount);
    
    // Update account balance for collection
    await this.updateAccountBalanceForCollection(payment.amount, newPayment.id);
    
    return newPayment;
  }

  // Account Balance Management
  async getAccountBalance(): Promise<AccountBalance> {
    const balance = storageService.get<AccountBalance>('accountBalance');
    if (!balance) {
      const defaultBalance: AccountBalance = {
        id: '1',
        availableBalance: 0,
        totalDisbursed: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        lastUpdated: new Date().toISOString()
      };
      storageService.set('accountBalance', defaultBalance);
      return defaultBalance;
    }
    return balance;
  }

  async updateAvailableBalance(amount: number, description: string): Promise<AccountBalance> {
    const currentBalance = await this.getAccountBalance();
    const newBalance: AccountBalance = {
      ...currentBalance,
      availableBalance: amount,
      lastUpdated: new Date().toISOString()
    };
    
    storageService.set('accountBalance', newBalance);
    
    // Record transaction
    await this.recordBalanceTransaction('deposit', amount - currentBalance.availableBalance, description, undefined, undefined, amount);
    
    return newBalance;
  }

  async getBalanceTransactions(): Promise<BalanceTransaction[]> {
    return storageService.get<BalanceTransaction[]>('balanceTransactions') || [];
  }

  // Reports
  async generateReports(): Promise<ReportData> {
    const [borrowers, loans, payments] = await Promise.all([
      this.getBorrowers(),
      this.getLoans(),
      this.getPayments()
    ]);

    const currentDate = new Date();
    
    // Outstanding loans
    const outstandingLoans = loans.filter(loan => loan.status === 'active' && loan.outstandingAmount > 0);
    
    // Past due loans
    const pastDueLoans = loans.filter(loan => {
      const dueDate = new Date(loan.dueDate);
      return loan.status === 'active' && dueDate < currentDate && loan.outstandingAmount > 0;
    });

    // Borrowers report
    const borrowersReport = borrowers.map(borrower => {
      const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
      const totalBorrowed = borrowerLoans.reduce((sum, loan) => sum + loan.principal, 0);
      const totalPaid = borrowerLoans.reduce((sum, loan) => sum + loan.paidAmount, 0);
      const currentOutstanding = borrowerLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);

      return {
        borrower,
        loans: borrowerLoans,
        totalBorrowed,
        totalPaid,
        currentOutstanding
      };
    });

    // Portfolio summary
    const totalBorrowers = borrowers.length;
    const totalLoansIssued = loans.length;
    const totalAmountDisbursed = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalAmountCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const averageLoanSize = totalLoansIssued > 0 ? totalAmountDisbursed / totalLoansIssued : 0;
    const defaultedLoans = loans.filter(loan => loan.status === 'defaulted').length;
    const defaultRate = totalLoansIssued > 0 ? (defaultedLoans / totalLoansIssued) * 100 : 0;

    const portfolioSummary = {
      totalBorrowers,
      totalLoansIssued,
      totalAmountDisbursed,
      totalAmountCollected,
      totalOutstanding,
      averageLoanSize,
      defaultRate
    };

    return {
      outstandingLoans,
      pastDueLoans,
      borrowersReport,
      portfolioSummary
    };
  }

  // Helper methods (only used in localStorage mode)
  private calculateLoanDetails(principal: number, interestRate: number, interestType: string, duration: LoanDuration) {
    let totalInterest = 0;
    let totalAmount = 0;
    let emi = 0;

    if (interestType === 'simple') {
      totalInterest = principal * (interestRate / 100);
      totalAmount = principal + totalInterest;
    } else {
      let timeInYears = 0;
      if (duration.unit === 'weeks') {
        timeInYears = duration.value / 52;
      } else {
        timeInYears = duration.value / 12;
      }
      totalInterest = principal * (interestRate / 100) * timeInYears;
      totalAmount = principal + totalInterest;
    }

    const totalPeriods = duration.value;
    emi = totalAmount / totalPeriods;

    return {
      emi: Math.round(emi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }

  private async recordBalanceTransaction(
    type: 'deposit' | 'disbursement' | 'collection',
    amount: number,
    description: string,
    loanId?: string,
    paymentId?: string,
    balanceAfter?: number
  ): Promise<void> {
    const transaction: BalanceTransaction = {
      id: this.generateId(),
      type,
      amount,
      description,
      relatedLoanId: loanId,
      relatedPaymentId: paymentId,
      balanceAfter: balanceAfter || 0,
      createdAt: new Date().toISOString()
    };

    const transactions = await this.getBalanceTransactions();
    transactions.push(transaction);
    storageService.set('balanceTransactions', transactions);
  }

  private async updateAccountBalanceForDisbursement(amount: number, loanId: string): Promise<void> {
    const currentBalance = await this.getAccountBalance();
    const newBalance: AccountBalance = {
      ...currentBalance,
      availableBalance: currentBalance.availableBalance - amount,
      totalDisbursed: currentBalance.totalDisbursed + amount,
      totalOutstanding: currentBalance.totalOutstanding + amount,
      lastUpdated: new Date().toISOString()
    };
    
    storageService.set('accountBalance', newBalance);
    await this.recordBalanceTransaction('disbursement', amount, `Loan disbursement`, loanId, undefined, newBalance.availableBalance);
  }

  private async updateAccountBalanceForCollection(amount: number, paymentId: string): Promise<void> {
    const currentBalance = await this.getAccountBalance();
    const newBalance: AccountBalance = {
      ...currentBalance,
      availableBalance: currentBalance.availableBalance + amount,
      totalCollected: currentBalance.totalCollected + amount,
      totalOutstanding: Math.max(0, currentBalance.totalOutstanding - amount),
      lastUpdated: new Date().toISOString()
    };
    
    storageService.set('accountBalance', newBalance);
    await this.recordBalanceTransaction('collection', amount, `Loan repayment`, undefined, paymentId, newBalance.availableBalance);
  }

  private async updateBorrowerStats(borrowerId: string): Promise<void> {
    const loans = await this.getLoans();
    const borrowerLoans = loans.filter(l => l.borrowerId === borrowerId);
    
    const totalLoans = borrowerLoans.length;
    const totalOutstanding = borrowerLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    
    await this.updateBorrower(borrowerId, { totalLoans, totalOutstanding });
  }

  private async updateLoanPayment(loanId: string, paymentAmount: number): Promise<void> {
    const loans = await this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    
    if (loan) {
      const newOutstandingAmount = Math.max(0, loan.outstandingAmount - paymentAmount);
      const newPaidAmount = loan.paidAmount + paymentAmount;
      const newStatus = newOutstandingAmount === 0 ? 'completed' : loan.status;
      
      await this.updateLoan(loanId, {
        outstandingAmount: newOutstandingAmount,
        paidAmount: newPaidAmount,
        status: newStatus as any
      });
      
      // Update borrower stats
      await this.updateBorrowerStats(loan.borrowerId);
    }
  }
}

export const apiService = new ApiService();