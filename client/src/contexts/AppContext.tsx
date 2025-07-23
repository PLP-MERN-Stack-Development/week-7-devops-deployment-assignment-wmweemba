import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Borrower, Loan, Payment, AccountBalance, BalanceTransaction, ReportData } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';

interface AppContextType extends AppState {
  // Borrower actions
  fetchBorrowers: () => Promise<void>;
  createBorrower: (borrower: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>) => Promise<void>;
  updateBorrower: (id: string, updates: Partial<Borrower>) => Promise<void>;
  deleteBorrower: (id: string) => Promise<void>;
  
  // Loan actions
  fetchLoans: () => Promise<void>;
  createLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  
  // Payment actions
  fetchPayments: () => Promise<void>;
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  
  // Account balance actions
  fetchAccountBalance: () => Promise<void>;
  updateAvailableBalance: (amount: number, description: string) => Promise<void>;
  fetchBalanceTransactions: () => Promise<void>;
  
  // Reports
  generateReports: () => Promise<ReportData>;
  
  // Utility
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_BORROWERS'; payload: Borrower[] }
  | { type: 'ADD_BORROWER'; payload: Borrower }
  | { type: 'UPDATE_BORROWER'; payload: { id: string; updates: Partial<Borrower> } }
  | { type: 'REMOVE_BORROWER'; payload: string }
  | { type: 'SET_LOANS'; payload: Loan[] }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: { id: string; updates: Partial<Loan> } }
  | { type: 'REMOVE_LOAN'; payload: string }
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'SET_ACCOUNT_BALANCE'; payload: AccountBalance }
  | { type: 'SET_BALANCE_TRANSACTIONS'; payload: BalanceTransaction[] };

const initialState: AppState = {
  borrowers: [],
  loans: [],
  payments: [],
  accountBalance: null,
  balanceTransactions: [],
  loading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_BORROWERS':
      return { ...state, borrowers: action.payload };
    case 'ADD_BORROWER':
      return { ...state, borrowers: [...state.borrowers, action.payload] };
    case 'UPDATE_BORROWER':
      return {
        ...state,
        borrowers: state.borrowers.map(b => 
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
        )
      };
    case 'REMOVE_BORROWER':
      return {
        ...state,
        borrowers: state.borrowers.filter(b => b.id !== action.payload)
      };
    case 'SET_LOANS':
      return { ...state, loans: action.payload };
    case 'ADD_LOAN':
      return { ...state, loans: [...state.loans, action.payload] };
    case 'UPDATE_LOAN':
      return {
        ...state,
        loans: state.loans.map(l => 
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        )
      };
    case 'REMOVE_LOAN':
      return {
        ...state,
        loans: state.loans.filter(l => l.id !== action.payload)
      };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'SET_ACCOUNT_BALANCE':
      return { ...state, accountBalance: action.payload };
    case 'SET_BALANCE_TRANSACTIONS':
      return { ...state, balanceTransactions: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBorrowers();
      fetchLoans();
      fetchPayments();
      fetchAccountBalance();
      fetchBalanceTransactions();
    }
  }, [isAuthenticated]);

  const fetchBorrowers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const borrowers = await apiService.getBorrowers();
      dispatch({ type: 'SET_BORROWERS', payload: borrowers });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch borrowers' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createBorrower = async (borrower: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newBorrower = await apiService.createBorrower(borrower);
      dispatch({ type: 'ADD_BORROWER', payload: newBorrower });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create borrower' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBorrower = async (id: string, updates: Partial<Borrower>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedBorrower = await apiService.updateBorrower(id, updates);
      dispatch({ type: 'UPDATE_BORROWER', payload: { id, updates: updatedBorrower } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update borrower' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteBorrower = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiService.deleteBorrower(id);
      dispatch({ type: 'REMOVE_BORROWER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete borrower' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchLoans = async () => {
    try {
      const loans = await apiService.getLoans();
      dispatch({ type: 'SET_LOANS', payload: loans });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch loans' });
    }
  };

  const createLoan = async (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newLoan = await apiService.createLoan(loan);
      dispatch({ type: 'ADD_LOAN', payload: newLoan });
      // Refresh borrowers and account balance to update stats
      await fetchBorrowers();
      await fetchAccountBalance();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create loan' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateLoan = async (id: string, updates: Partial<Loan>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedLoan = await apiService.updateLoan(id, updates);
      dispatch({ type: 'UPDATE_LOAN', payload: { id, updates: updatedLoan } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update loan' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiService.deleteLoan(id);
      dispatch({ type: 'REMOVE_LOAN', payload: id });
      // Refresh borrowers and account balance to update stats
      await fetchBorrowers();
      await fetchAccountBalance();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete loan' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchPayments = async () => {
    try {
      const payments = await apiService.getPayments();
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch payments' });
    }
  };

  const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newPayment = await apiService.createPayment(payment);
      dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
      // Refresh loans, borrowers, and account balance to update amounts
      await fetchLoans();
      await fetchBorrowers();
      await fetchAccountBalance();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create payment' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchAccountBalance = async () => {
    try {
      const balance = await apiService.getAccountBalance();
      dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: balance });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch account balance' });
    }
  };

  const updateAvailableBalance = async (amount: number, description: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedBalance = await apiService.updateAvailableBalance(amount, description);
      dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: updatedBalance });
      await fetchBalanceTransactions();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update balance' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchBalanceTransactions = async () => {
    try {
      const transactions = await apiService.getBalanceTransactions();
      dispatch({ type: 'SET_BALANCE_TRANSACTIONS', payload: transactions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch balance transactions' });
    }
  };

  const generateReports = async (): Promise<ReportData> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      return await apiService.generateReports();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to generate reports' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      fetchBorrowers,
      createBorrower,
      updateBorrower,
      deleteBorrower,
      fetchLoans,
      createLoan,
      updateLoan,
      deleteLoan,
      fetchPayments,
      createPayment,
      fetchAccountBalance,
      updateAvailableBalance,
      fetchBalanceTransactions,
      generateReports,
      clearError
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}