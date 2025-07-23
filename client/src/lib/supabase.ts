import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      borrowers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          address: string;
          email: string | null;
          joining_date: string;
          status: 'active' | 'inactive';
          total_loans: number;
          total_outstanding: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          address: string;
          email?: string | null;
          joining_date: string;
          status?: 'active' | 'inactive';
          total_loans?: number;
          total_outstanding?: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          address?: string;
          email?: string | null;
          joining_date?: string;
          status?: 'active' | 'inactive';
          total_loans?: number;
          total_outstanding?: number;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          borrower_id: string;
          borrower_name: string;
          principal: number;
          interest_rate: number;
          interest_type: 'simple' | 'annual';
          duration_value: number;
          duration_unit: 'weeks' | 'months';
          term_in_months: number;
          start_date: string;
          due_date: string;
          status: 'active' | 'completed' | 'overdue' | 'defaulted';
          emi: number;
          total_interest: number;
          total_amount: number;
          outstanding_amount: number;
          paid_amount: number;
          disbursement_date: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          borrower_id: string;
          borrower_name: string;
          principal: number;
          interest_rate: number;
          interest_type?: 'simple' | 'annual';
          duration_value: number;
          duration_unit: 'weeks' | 'months';
          term_in_months: number;
          start_date: string;
          due_date: string;
          status?: 'active' | 'completed' | 'overdue' | 'defaulted';
          emi: number;
          total_interest: number;
          total_amount: number;
          outstanding_amount: number;
          paid_amount: number;
          disbursement_date?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          borrower_name?: string;
          principal?: number;
          interest_rate?: number;
          interest_type?: 'simple' | 'annual';
          duration_value?: number;
          duration_unit?: 'weeks' | 'months';
          term_in_months?: number;
          start_date?: string;
          due_date?: string;
          status?: 'active' | 'completed' | 'overdue' | 'defaulted';
          emi?: number;
          total_interest?: number;
          total_amount?: number;
          outstanding_amount?: number;
          paid_amount?: number;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          loan_id: string;
          borrower_id: string;
          amount: number;
          payment_date: string;
          payment_type: 'emi' | 'partial' | 'full';
          description: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          borrower_id: string;
          amount: number;
          payment_date: string;
          payment_type: 'emi' | 'partial' | 'full';
          description?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          payment_type?: 'emi' | 'partial' | 'full';
          description?: string | null;
        };
      };
      account_balance: {
        Row: {
          id: string;
          available_balance: number;
          total_disbursed: number;
          total_collected: number;
          total_outstanding: number;
          last_updated: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          available_balance: number;
          total_disbursed?: number;
          total_collected?: number;
          total_outstanding?: number;
          last_updated?: string;
          user_id: string;
        };
        Update: {
          available_balance?: number;
          total_disbursed?: number;
          total_collected?: number;
          total_outstanding?: number;
          last_updated?: string;
        };
      };
      balance_transactions: {
        Row: {
          id: string;
          type: 'deposit' | 'disbursement' | 'collection';
          amount: number;
          description: string;
          related_loan_id: string | null;
          related_payment_id: string | null;
          balance_after: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          type: 'deposit' | 'disbursement' | 'collection';
          amount: number;
          description: string;
          related_loan_id?: string | null;
          related_payment_id?: string | null;
          balance_after: number;
          created_at?: string;
          user_id: string;
        };
        Update: {
          type?: 'deposit' | 'disbursement' | 'collection';
          amount?: number;
          description?: string;
          related_loan_id?: string | null;
          related_payment_id?: string | null;
          balance_after?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};