import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, CreditCard, Edit, Trash2, Eye, Calendar, Timer } from 'lucide-react';
import { LoanForm } from '@/components/loans/LoanForm';
import { LoanDetails } from '@/components/loans/LoanDetails';
import { Loan } from '@/types';
import { toast } from 'sonner';

export function Loans() {
  const { loans, deleteLoan, payments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredLoans = loans.filter(loan =>
    loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (loan: Loan) => {
    // Check if loan has any payments
    const loanPayments = payments.filter(payment => payment.loanId === loan.id);
    
    if (loanPayments.length > 0) {
      const totalPaid = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const confirmMessage = `This loan has ${loanPayments.length} payment(s) totaling K${totalPaid.toLocaleString()}. Are you sure you want to delete this loan and all its payment history?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else {
      // Standard confirmation for loans with no payments
      if (!window.confirm(`Are you sure you want to delete this loan for ${loan.borrowerName}?`)) {
        return;
      }
    }
    
    try {
      await deleteLoan(loan.id);
      toast.success('Loan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete loan');
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleView = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLoan(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedLoan(null);
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

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDuration = (loan: Loan) => {
    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
    return `${duration.value} ${duration.unit}`;
  };

  const getPaymentFrequency = (loan: Loan) => {
    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
    return duration.unit === 'weeks' ? 'Weekly' : 'Monthly';
  };

  const canDeleteLoan = (loan: Loan) => {
    // Allow deletion of any loan, but show appropriate warnings
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-1">Manage loan portfolio and track repayments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Loan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <CardTitle>All Loans ({loans.length})</CardTitle>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {loans.length === 0 ? 'No loans yet' : 'No loans match your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLoans.map((loan) => {
                const daysOverdue = getDaysOverdue(loan.dueDate);
                const isOverdue = loan.status === 'active' && daysOverdue > 0;
                const loanPayments = payments.filter(payment => payment.loanId === loan.id);
                const hasPayments = loanPayments.length > 0;
                
                return (
                  <div key={loan.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{loan.borrowerName}</h3>
                        <p className="text-sm text-gray-600">Loan ID: {loan.id.slice(-8)}</p>
                      </div>
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Principal:</span>
                        <span className="font-medium">K{loan.principal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Interest:</span>
                        <span className="font-medium">
                          {loan.interestRate}% ({loan.interestType || 'Simple'})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span className="font-medium">{formatDuration(loan)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{getPaymentFrequency(loan)} Payment:</span>
                        <span className="font-medium">K{loan.emi.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Outstanding:</span>
                        <span className="font-medium text-red-600">
                          K{loan.outstandingAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Paid:</span>
                        <span className="font-medium text-green-600">
                          K{loan.paidAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                      {isOverdue && (
                        <span className="text-red-600 font-medium">
                          ({daysOverdue} days overdue)
                        </span>
                      )}
                    </div>

                    {/* Interest Type Indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Timer className="w-3 h-3" />
                      <span className="capitalize">
                        {loan.interestType || 'Simple'} Interest Method
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(loan)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(loan)}
                        disabled={loan.status === 'completed'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(loan)}
                        className={`${hasPayments ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                        title={hasPayments ? 'Delete loan and payment history' : 'Delete loan'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Form Modal */}
      {showForm && (
        <LoanForm
          loan={editingLoan}
          onClose={handleFormClose}
        />
      )}

      {/* Loan Details Modal */}
      {showDetails && selectedLoan && (
        <LoanDetails
          loan={selectedLoan}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
}