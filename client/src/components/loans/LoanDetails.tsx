import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loan } from '@/types';
import { CreditCard, Calendar, DollarSign, Receipt, User, Percent, Clock, Timer } from 'lucide-react';
import { toast } from 'sonner';

interface LoanDetailsProps {
  loan: Loan;
  onClose: () => void;
}

export function LoanDetails({ loan, onClose }: LoanDetailsProps) {
  const { payments, updateLoan } = useApp();
  
  const loanPayments = payments.filter(payment => payment.loanId === loan.id);
  const sortedPayments = loanPayments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleMarkAsClosed = async () => {
    if (loan.outstandingAmount > 0) {
      toast.error('Cannot close loan with outstanding balance');
      return;
    }

    if (window.confirm('Are you sure you want to mark this loan as completed?')) {
      try {
        await updateLoan(loan.id, { status: 'completed' });
        toast.success('Loan marked as completed');
        onClose();
      } catch (error) {
        toast.error('Failed to update loan status');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'defaulted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = loan.totalAmount > 0 ? (loan.paidAmount / loan.totalAmount) * 100 : 0;

  // Format duration display
  const formatDuration = () => {
    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
    return `${duration.value} ${duration.unit}`;
  };

  // Format payment frequency
  const getPaymentFrequency = () => {
    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
    return duration.unit === 'weeks' ? 'Weekly' : 'Monthly';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Loan Details - {loan.borrowerName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Loan Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Loan Information</CardTitle>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Borrower</p>
                    <p className="font-medium">{loan.borrowerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Principal</p>
                    <p className="font-medium">K{loan.principal.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Percent className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="font-medium">{loan.interestRate}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Interest Type</p>
                    <p className="font-medium capitalize">
                      {loan.interestType || 'Simple'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formatDuration()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(loan.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">K{loan.emi.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{getPaymentFrequency()} Payment</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">K{loan.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">K{loan.paidAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">K{loan.outstandingAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Outstanding</p>
                </div>
              </div>
              
              {/* Interest Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">K{loan.totalInterest.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Interest</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">
                    {loan.interestType === 'simple' ? 'Fixed' : 'Prorated'}
                  </p>
                  <p className="text-sm text-gray-600">Interest Method</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repayment Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment History ({loanPayments.length})
              </CardTitle>
              <CardDescription>All payments made against this loan</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedPayments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No payments recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {sortedPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-600">
                          K{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                        {payment.description && (
                          <p className="text-xs text-gray-500">{payment.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {payment.paymentType}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between pt-4">
          <div>
            {loan.status === 'active' && loan.outstandingAmount === 0 && (
              <Button onClick={handleMarkAsClosed} variant="outline">
                Mark as Closed
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}