import { Borrower, Loan, Payment, AccountBalance, BalanceTransaction } from '@/types';
import { storageService } from './storage';

export function initializeSampleData() {
  // Force complete data wipe on every initialization
  storageService.wipeAllData();

  // Initialize with completely empty data arrays
  const emptyBorrowers: Borrower[] = [];
  const emptyLoans: Loan[] = [];
  const emptyPayments: Payment[] = [];

  // Initialize with zero account balance
  const zeroAccountBalance: AccountBalance = {
    id: '1',
    availableBalance: 0,
    totalDisbursed: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    lastUpdated: new Date().toISOString()
  };

  // Initialize with empty balance transactions
  const emptyBalanceTransactions: BalanceTransaction[] = [];

  // Store completely empty data
  storageService.set('borrowers', emptyBorrowers);
  storageService.set('loans', emptyLoans);
  storageService.set('payments', emptyPayments);
  storageService.set('accountBalance', zeroAccountBalance);
  storageService.set('balanceTransactions', emptyBalanceTransactions);

  console.log('🧹 COMPLETE DATA WIPE: All dummy data cleared - system ready for fresh start');
}