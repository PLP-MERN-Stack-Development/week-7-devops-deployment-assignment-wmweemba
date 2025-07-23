import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PaymentFormProps {
  onClose: () => void;
}

export function PaymentForm({ onClose }: PaymentFormProps) {
  const { loans, createPayment, loading } = useApp();
  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'emi' as 'emi' | 'partial' | 'full',
    description: ''
  });

  // Only show active loans with outstanding amounts
  const availableLoans = loans.filter(loan => 
    loan.status === 'active' && loan.outstandingAmount > 0
  );

  const selectedLoan = loans.find(loan => loan.id === formData.loanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (!selectedLoan) {
      toast.error('Please select a loan');
      return;
    }

    if (amount > selectedLoan.outstandingAmount) {
      toast.error('Payment amount cannot exceed outstanding balance');
      return;
    }

    try {
      await createPayment({
        loanId: formData.loanId,
        borrowerId: selectedLoan.borrowerId,
        amount,
        paymentDate: formData.paymentDate,
        paymentType: formData.paymentType,
        description: formData.description || `${formData.paymentType.toUpperCase()} payment`
      });
      toast.success('Payment recorded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const suggestPaymentType = (amount: number, loan: any) => {
    if (!loan) return 'partial';
    
    if (amount >= loan.outstandingAmount) {
      return 'full';
    } else if (Math.abs(amount - loan.emi) < 1) {
      return 'emi';
    } else {
      return 'partial';
    }
  };

  // Auto-suggest payment type when amount changes
  React.useEffect(() => {
    if (formData.amount && selectedLoan) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount)) {
        const suggestedType = suggestPaymentType(amount, selectedLoan);
        setFormData(prev => ({ ...prev, paymentType: suggestedType }));
      }
    }
  }, [formData.amount, selectedLoan]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a new payment against an active loan
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanId">Select Loan *</Label>
            <Select value={formData.loanId} onValueChange={(value) => handleChange('loanId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a loan to pay" />
              </SelectTrigger>
              <SelectContent>
                {availableLoans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.borrowerName} - K{loan.principal.toLocaleString()} 
                    (Outstanding: K{loan.outstandingAmount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLoan && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Loan Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-600">Borrower:</span>
                  <span className="ml-2 font-medium">{selectedLoan.borrowerName}</span>
                </div>
                <div>
                  <span className="text-blue-600">Monthly EMI:</span>
                  <span className="ml-2 font-medium">K{selectedLoan.emi.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600">Outstanding:</span>
                  <span className="ml-2 font-medium text-red-600">K{selectedLoan.outstandingAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600">Due Date:</span>
                  <span className="ml-2 font-medium">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (ZMW) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={selectedLoan?.outstandingAmount || undefined}
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Enter payment amount"
                required
              />
              {selectedLoan && (
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('amount', selectedLoan.emi.toString())}
                  >
                    EMI (K{selectedLoan.emi.toLocaleString()})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('amount', selectedLoan.outstandingAmount.toString())}
                  >
                    Full (K{selectedLoan.outstandingAmount.toLocaleString()})
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={formData.paymentType} onValueChange={(value) => handleChange('paymentType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emi">EMI Payment</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="full">Full Settlement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional payment description"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.loanId}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}