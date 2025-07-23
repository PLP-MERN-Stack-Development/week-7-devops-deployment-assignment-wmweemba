import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Borrower } from '@/types';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Receipt } from 'lucide-react';

interface BorrowerDetailsProps {
  borrower: Borrower;
  onClose: () => void;
}

export function BorrowerDetails({ borrower, onClose }: BorrowerDetailsProps) {
  const { loans, payments } = useApp();
  
  const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
  const borrowerPayments = payments.filter(payment => payment.borrowerId === borrower.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {borrower.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{borrower.phone}</span>
              </div>
              {borrower.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{borrower.email}</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <span>{borrower.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Joined: {new Date(borrower.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={borrower.status === 'active' ? 'default' : 'secondary'}
                  className={borrower.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {borrower.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Loan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{borrower.totalLoans}</p>
                  <p className="text-sm text-gray-600">Total Loans</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    K{borrower.totalOutstanding.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Loans */}
          {borrowerLoans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Loans</CardTitle>
                <CardDescription>Latest loan activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {borrowerLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">K{loan.principal.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {loan.interestRate}% • {loan.termInMonths} months
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            loan.status === 'active' ? 'default' :
                            loan.status === 'completed' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {loan.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          K{loan.outstandingAmount.toLocaleString()} due
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Payments */}
          {borrowerPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Recent Payments
                </CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {borrowerPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-600">
                          +K{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {payment.paymentType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}