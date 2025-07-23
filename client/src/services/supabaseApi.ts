import { supabase } from '@/lib/supabase';
import { Borrower, Loan, Payment, User, AccountBalance, BalanceTransaction, ReportData, LoanDuration } from '@/types';

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

// Helper function to convert database row to app types
const convertBorrowerFromDb = (row: any): Borrower => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  address: row.address,
  email: row.email,
  joiningDate: row.joining_date,
  status: row.status,
  totalLoans: row.total_loans,
  totalOutstanding: row.total_outstanding,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const convertLoanFromDb = (row: any): Loan => ({
  id: row.id,
  borrowerId: row.borrower_id,
  borrowerName: row.borrower_name,
  principal: row.principal,
  interestRate: row.interest_rate,
  interestType: row.interest_type,
  duration: {
    value: row.duration_value,
    unit: row.duration_unit
  },
  termInMonths: row.term_in_months,
  startDate: row.start_date,
  dueDate: row.due_date,
  status: row.status,
  emi: row.emi,
  totalInterest: row.total_interest,
  totalAmount: row.total_amount,
  outstandingAmount: row.outstanding_amount,
  paidAmount: row.paid_amount,
  disbursementDate: row.disbursement_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const convertPaymentFromDb = (row: any): Payment => ({
  id: row.id,
  loanId: row.loan_id,
  borrowerId: row.borrower_id,
  amount: row.amount,
  paymentDate: row.payment_date,
  paymentType: row.payment_type,
  description: row.description,
  createdAt: row.created_at
});

const convertAccountBalanceFromDb = (row: any): AccountBalance => ({
  id: row.id,
  availableBalance: row.available_balance,
  totalDisbursed: row.total_disbursed,
  totalCollected: row.total_collected,
  totalOutstanding: row.total_outstanding,
  lastUpdated: row.last_updated
});

const convertBalanceTransactionFromDb = (row: any): BalanceTransaction => ({
  id: row.id,
  type: row.type,
  amount: row.amount,
  description: row.description,
  relatedLoanId: row.related_loan_id,
  relatedPaymentId: row.related_payment_id,
  balanceAfter: row.balance_after,
  createdAt: row.created_at
});

export class SupabaseApiService {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // If sign in fails with invalid credentials, try to sign up
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('User not found, attempting to create new account...');
          return await this.signUp(email, password);
        }
        throw new Error(signInError.message);
      }

      if (!signInData.user) throw new Error('Login failed');

      const user: User = {
        id: signInData.user.id,
        username: signInData.user.email?.split('@')[0] || 'user',
        email: signInData.user.email || '',
        role: 'admin',
        createdAt: signInData.user.created_at
      };

      return {
        user,
        token: signInData.session?.access_token || ''
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (error) {
        // If user already exists, try to sign in instead
        if (error.message.includes('User already registered')) {
          console.log('User already exists, attempting to sign in...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) throw new Error(signInError.message);
          if (!signInData.user) throw new Error('Sign in failed');

          const user: User = {
            id: signInData.user.id,
            username: signInData.user.email?.split('@')[0] || 'user',
            email: signInData.user.email || '',
            role: 'admin',
            createdAt: signInData.user.created_at
          };

          return {
            user,
            token: signInData.session?.access_token || ''
          };
        }
        throw new Error(error.message);
      }

      if (!data.user) throw new Error('Sign up failed');

      const user: User = {
        id: data.user.id,
        username: data.user.email?.split('@')[0] || 'user',
        email: data.user.email || '',
        role: 'admin',
        createdAt: data.user.created_at
      };

      return {
        user,
        token: data.session?.access_token || ''
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  // Borrowers - Shared across all users (no user_id filter)
  async getBorrowers(): Promise<Borrower[]> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return data.map(convertBorrowerFromDb);
  }

  async createBorrower(borrower: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>): Promise<Borrower> {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('borrowers')
      .insert({
        name: borrower.name,
        phone: borrower.phone,
        address: borrower.address,
        email: borrower.email,
        joining_date: borrower.joiningDate,
        status: borrower.status,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return convertBorrowerFromDb(data);
  }

  async updateBorrower(id: string, updates: Partial<Borrower>): Promise<Borrower> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.address) updateData.address = updates.address;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.joiningDate) updateData.joining_date = updates.joiningDate;
    if (updates.status) updateData.status = updates.status;
    if (updates.totalLoans !== undefined) updateData.total_loans = updates.totalLoans;
    if (updates.totalOutstanding !== undefined) updateData.total_outstanding = updates.totalOutstanding;

    const { data, error } = await supabase
      .from('borrowers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return convertBorrowerFromDb(data);
  }

  async deleteBorrower(id: string): Promise<void> {
    const { error } = await supabase
      .from('borrowers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Loans - Shared across all users (no user_id filter)
  async getLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return data.map(convertLoanFromDb);
  }

  async createLoan(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>): Promise<Loan> {
    const userId = await getCurrentUserId();
    
    // Calculate loan details
    const loanCalculations = this.calculateLoanDetails(
      loan.principal,
      loan.interestRate,
      loan.interestType || 'simple',
      loan.duration || { value: loan.termInMonths, unit: 'months' }
    );

    const { data, error } = await supabase
      .from('loans')
      .insert({
        borrower_id: loan.borrowerId,
        borrower_name: loan.borrowerName,
        principal: loan.principal,
        interest_rate: loan.interestRate,
        interest_type: loan.interestType || 'simple',
        duration_value: loan.duration?.value || loan.termInMonths,
        duration_unit: loan.duration?.unit || 'months',
        term_in_months: loan.termInMonths,
        start_date: loan.startDate,
        due_date: loan.dueDate,
        status: loan.status,
        emi: loanCalculations.emi,
        total_interest: loanCalculations.totalInterest,
        total_amount: loanCalculations.totalAmount,
        outstanding_amount: loanCalculations.totalAmount,
        paid_amount: 0,
        disbursement_date: new Date().toISOString(),
        user_id: userId
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Update borrower stats and account balance
    await this.updateBorrowerStats(loan.borrowerId);
    await this.updateAccountBalanceForDisbursement(loan.principal, data.id);
    
    return convertLoanFromDb(data);
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const updateData: any = {};
    if (updates.borrowerName) updateData.borrower_name = updates.borrowerName;
    if (updates.principal !== undefined) updateData.principal = updates.principal;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
    if (updates.interestType) updateData.interest_type = updates.interestType;
    if (updates.duration) {
      updateData.duration_value = updates.duration.value;
      updateData.duration_unit = updates.duration.unit;
    }
    if (updates.termInMonths !== undefined) updateData.term_in_months = updates.termInMonths;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.dueDate) updateData.due_date = updates.dueDate;
    if (updates.status) updateData.status = updates.status;
    if (updates.emi !== undefined) updateData.emi = updates.emi;
    if (updates.totalInterest !== undefined) updateData.total_interest = updates.totalInterest;
    if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
    if (updates.outstandingAmount !== undefined) updateData.outstanding_amount = updates.outstandingAmount;
    if (updates.paidAmount !== undefined) updateData.paid_amount = updates.paidAmount;

    const { data, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return convertLoanFromDb(data);
  }

  async deleteLoan(id: string): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Payments - Shared across all users (no user_id filter)
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return data.map(convertPaymentFromDb);
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        loan_id: payment.loanId,
        borrower_id: payment.borrowerId,
        amount: payment.amount,
        payment_date: payment.paymentDate,
        payment_type: payment.paymentType,
        description: payment.description,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Update loan payment and account balance
    await this.updateLoanPayment(payment.loanId, payment.amount);
    await this.updateAccountBalanceForCollection(payment.amount, data.id);
    
    return convertPaymentFromDb(data);
  }

  // Account Balance - Use shared balance system
  async getAccountBalance(): Promise<AccountBalance> {
    // Get the shared account balance (first record)
    const { data, error } = await supabase
      .from('account_balance')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // Create initial shared balance if it doesn't exist
      if (error.code === 'PGRST116') {
        const userId = await getCurrentUserId();
        await this.createInitialAccountBalance(userId);
        return {
          id: '1',
          availableBalance: 0,
          totalDisbursed: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          lastUpdated: new Date().toISOString()
        };
      }
      throw new Error(error.message);
    }
    
    return convertAccountBalanceFromDb(data);
  }

  async updateAvailableBalance(amount: number, description: string): Promise<AccountBalance> {
    const userId = await getCurrentUserId();
    const currentBalance = await this.getAccountBalance();
    
    // Update the shared account balance
    const { data, error } = await supabase
      .from('account_balance')
      .update({
        available_balance: amount,
        last_updated: new Date().toISOString()
      })
      .eq('id', currentBalance.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Record transaction
    await this.recordBalanceTransaction('deposit', amount - currentBalance.availableBalance, description, undefined, undefined, amount);
    
    return convertAccountBalanceFromDb(data);
  }

  async getBalanceTransactions(): Promise<BalanceTransaction[]> {
    // Show all balance transactions (shared across all users)
    const { data, error } = await supabase
      .from('balance_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return data.map(convertBalanceTransactionFromDb);
  }

  private async createInitialAccountBalance(userId: string): Promise<void> {
    const { error } = await supabase
      .from('account_balance')
      .insert({
        user_id: userId,
        available_balance: 0,
        total_disbursed: 0,
        total_collected: 0,
        total_outstanding: 0
      });

    if (error) {
      console.error('Failed to create initial account balance:', error);
    }
  }

  // Reports - Now includes all data
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

  // Helper methods
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
      
      await this.updateBorrowerStats(loan.borrowerId);
    }
  }

  private async updateAccountBalanceForDisbursement(amount: number, loanId: string): Promise<void> {
    const currentBalance = await this.getAccountBalance();
    
    // Update the shared account balance
    const { error } = await supabase
      .from('account_balance')
      .update({
        available_balance: currentBalance.availableBalance - amount,
        total_disbursed: currentBalance.totalDisbursed + amount,
        total_outstanding: currentBalance.totalOutstanding + amount,
        last_updated: new Date().toISOString()
      })
      .eq('id', currentBalance.id);

    if (error) throw new Error(error.message);
    
    await this.recordBalanceTransaction('disbursement', amount, 'Loan disbursement', loanId, undefined, currentBalance.availableBalance - amount);
  }

  private async updateAccountBalanceForCollection(amount: number, paymentId: string): Promise<void> {
    const currentBalance = await this.getAccountBalance();
    
    // Update the shared account balance
    const { error } = await supabase
      .from('account_balance')
      .update({
        available_balance: currentBalance.availableBalance + amount,
        total_collected: currentBalance.totalCollected + amount,
        total_outstanding: Math.max(0, currentBalance.totalOutstanding - amount),
        last_updated: new Date().toISOString()
      })
      .eq('id', currentBalance.id);

    if (error) throw new Error(error.message);
    
    await this.recordBalanceTransaction('collection', amount, 'Loan repayment', undefined, paymentId, currentBalance.availableBalance + amount);
  }

  private async recordBalanceTransaction(
    type: 'deposit' | 'disbursement' | 'collection',
    amount: number,
    description: string,
    loanId?: string,
    paymentId?: string,
    balanceAfter?: number
  ): Promise<void> {
    const userId = await getCurrentUserId();
    
    const { error } = await supabase
      .from('balance_transactions')
      .insert({
        type,
        amount,
        description,
        related_loan_id: loanId,
        related_payment_id: paymentId,
        balance_after: balanceAfter || 0,
        user_id: userId
      });

    if (error) {
      console.error('Failed to record balance transaction:', error);
    }
  }
}

export const supabaseApiService = new SupabaseApiService();