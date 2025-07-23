import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Receipt, Calendar, Filter } from 'lucide-react';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Payment } from '@/types';
import { toast } from 'sonner';

export function Payments() {
  const { payments, loans, borrowers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterBorrower, setFilterBorrower] = useState('all');
  const [filterLoan, setFilterLoan] = useState('all');

  const filteredPayments = payments.filter(payment => {
    const loan = loans.find(l => l.id === payment.loanId);
    const borrower = borrowers.find(b => b.id === payment.borrowerId);
    
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan?.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBorrower = filterBorrower === 'all' || payment.borrowerId === filterBorrower;
    const matchesLoan = filterLoan === 'all' || payment.loanId === filterLoan;
    
    return matchesSearch && matchesBorrower && matchesLoan;
  });

  const sortedPayments = filteredPayments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const todayPayments = payments.filter(payment => 
    new Date(payment.paymentDate).toDateString() === new Date().toDateString()
  );
  const todayTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'emi':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'full':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track and manage loan repayments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">K{todayTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayPayments.length} payments today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              K{payments.length > 0 ? (totalPayments / payments.length).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <CardTitle>Payment History ({payments.length})</CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={filterBorrower} onValueChange={setFilterBorrower}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by borrower" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Borrowers</SelectItem>
                  {borrowers.map((borrower) => (
                    <SelectItem key={borrower.id} value={borrower.id}>
                      {borrower.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterLoan} onValueChange={setFilterLoan}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by loan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Loans</SelectItem>
                  {loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {loan.borrowerName} - K{loan.principal.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {payments.length === 0 ? 'No payments recorded yet' : 'No payments match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPayments.map((payment) => {
                const loan = loans.find(l => l.id === payment.loanId);
                return (
                  <div key={payment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{loan?.borrowerName || 'Unknown Borrower'}</h4>
                        <Badge className={getPaymentTypeColor(payment.paymentType)}>
                          {payment.paymentType.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Loan: K{loan?.principal.toLocaleString()} @ {loan?.interestRate}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment ID: {payment.id.slice(-8)}
                      </p>
                      {payment.description && (
                        <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        K{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Recorded: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      {showForm && (
        <PaymentForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}