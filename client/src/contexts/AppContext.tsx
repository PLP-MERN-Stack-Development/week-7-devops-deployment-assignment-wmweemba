import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Borrower, Loan, Payment, AccountBalance, BalanceTransaction, ReportData } from '@/types';
// import { apiService } from '@/services/api'; // This might be an old import, api from './api' is preferred now.
import api from '@/services/api'; // Import the new axios instance directly or via a wrapper if apiService is a wrapper
import { useAuth } from './AuthContext';
import * as borrowerService from '@/services/borrowerService';
import * as loanService from '@/services/loanService';
import * as paymentService from '@/services/paymentService';

interface AppContextType extends AppState {
    // Borrower actions
    fetchBorrowers: () => Promise<void>;
    // Changed Omit<Borrower, 'id' ...> to Omit<Borrower, '_id' ...>
    createBorrower: (borrower: Omit<Borrower, '_id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>) => Promise<void>;
    // Changed id: string to _id: string
    updateBorrower: (_id: string, updates: Partial<Borrower>) => Promise<void>;
    // Changed id: string to _id: string
    deleteBorrower: (_id: string) => Promise<void>;

    // Loan actions
    fetchLoans: () => Promise<void>;
    createLoan: (loan: Omit<Loan, '_id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>) => Promise<void>;
    updateLoan: (_id: string, updates: Partial<Loan>) => Promise<void>;
    deleteLoan: (_id: string) => Promise<void>;

    // Payment actions
    fetchPayments: () => Promise<void>;
    createPayment: (payment: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>; // Added 'updatedAt' to Omit

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
    // Changed id: string to _id: string
    | { type: 'UPDATE_BORROWER'; payload: { _id: string; updates: Partial<Borrower> } }
    | { type: 'REMOVE_BORROWER'; payload: string }
    | { type: 'SET_LOANS'; payload: Loan[] }
    | { type: 'ADD_LOAN'; payload: Loan }
    | { type: 'UPDATE_LOAN'; payload: { _id: string; updates: Partial<Loan> } }
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
                // Use b._id for comparison and action.payload._id
                borrowers: state.borrowers.map(b =>
                    b._id === action.payload._id ? { ...b, ...action.payload.updates } : b
                )
            };
        case 'REMOVE_BORROWER':
            return {
                ...state,
                // Use b._id for comparison
                borrowers: state.borrowers.filter(b => b._id !== action.payload)
            };
        case 'SET_LOANS':
            return { ...state, loans: action.payload };
        case 'ADD_LOAN':
            return { ...state, loans: [...state.loans, action.payload] };
        case 'UPDATE_LOAN':
            return {
                ...state,
                loans: state.loans.map(l =>
                    l._id === action.payload._id ? { ...l, ...action.payload.updates } : l
                )
            };
        case 'REMOVE_LOAN':
            return {
                ...state,
                loans: state.loans.filter(l => l._id !== action.payload)
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
            const borrowers = await borrowerService.getBorrowers();
            dispatch({ type: 'SET_BORROWERS', payload: borrowers });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch borrowers' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Changed Omit<Borrower, 'id' ...> to Omit<Borrower, '_id' ...>
    const createBorrower = async (borrower: Omit<Borrower, '_id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newBorrower = await borrowerService.createBorrower(borrower);
            dispatch({ type: 'ADD_BORROWER', payload: newBorrower });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create borrower' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Changed id: string to _id: string
    const updateBorrower = async (_id: string, updates: Partial<Borrower>) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const updatedBorrower = await borrowerService.updateBorrower(_id, updates);
            // Ensure the payload for UPDATE_BORROWER uses _id
            dispatch({ type: 'UPDATE_BORROWER', payload: { _id, updates: updatedBorrower } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update borrower' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Changed id: string to _id: string
    const deleteBorrower = async (_id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await borrowerService.deleteBorrower(_id);
            dispatch({ type: 'REMOVE_BORROWER', payload: _id }); // Payload is now _id
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete borrower' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchLoans = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const loans = await loanService.getLoans();
            dispatch({ type: 'SET_LOANS', payload: loans });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch loans' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const createLoan = async (loan: Omit<Loan, '_id' | 'createdAt' | 'updatedAt' | 'emi' | 'totalInterest' | 'totalAmount' | 'outstandingAmount' | 'paidAmount'>) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newLoan = await loanService.createLoan(loan);
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

    const updateLoan = async (_id: string, updates: Partial<Loan>) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const updatedLoan = await loanService.updateLoan(_id, updates);
            dispatch({ type: 'UPDATE_LOAN', payload: { _id, updates: updatedLoan } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update loan' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteLoan = async (_id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await loanService.deleteLoan(_id);
            dispatch({ type: 'REMOVE_LOAN', payload: _id });
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
            dispatch({ type: 'SET_LOADING', payload: true });
            const payments = await paymentService.getPayments();
            dispatch({ type: 'SET_PAYMENTS', payload: payments });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch payments' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const createPayment = async (payment: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newPayment = await paymentService.createPayment(payment);
            dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
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
            // Assuming apiService or 'api' directly can fetch account balance
            const balance = await api.get<AccountBalance>('/account-balance'); // Adjust endpoint if different
            dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: balance.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch account balance' });
        }
    };

    const updateAvailableBalance = async (amount: number, description: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            // Assuming apiService or 'api' directly can update balance
            const updatedBalance = await api.post<AccountBalance>('/account-balance/update', { amount, description }); // Adjust endpoint/method
            dispatch({ type: 'SET_ACCOUNT_BALANCE', payload: updatedBalance.data });
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
            // Assuming apiService or 'api' directly can fetch transactions
            const transactions = await api.get<BalanceTransaction[]>('/balance-transactions'); // Adjust endpoint
            dispatch({ type: 'SET_BALANCE_TRANSACTIONS', payload: transactions.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch balance transactions' });
        }
    };

    const generateReports = async (): Promise<ReportData> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            // Assuming apiService or 'api' directly can generate reports
            const reports = await api.get<ReportData>('/reports/generate'); // Adjust endpoint
            return reports.data;
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
