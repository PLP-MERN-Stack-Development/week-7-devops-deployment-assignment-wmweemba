import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loan, LoanDuration } from '@/types';
import { toast } from 'sonner';

interface LoanFormProps {
  loan?: Loan | null;
  onClose: () => void;
}

export function LoanForm({ loan, onClose }: LoanFormProps) {
  const { borrowers, createLoan, updateLoan, loading } = useApp();
  const [formData, setFormData] = useState({
    borrowerId: '',
    principal: '',
    interestRate: '',
    interestType: 'simple' as 'simple' | 'annual',
    duration: { value: 1, unit: 'months' as 'weeks' | 'months' },
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'completed' | 'overdue' | 'defaulted'
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        borrowerId: loan.borrowerId,
        principal: loan.principal.toString(),
        interestRate: loan.interestRate.toString(),
        interestType: loan.interestType || 'simple',
        duration: loan.duration || { value: loan.termInMonths, unit: 'months' },
        startDate: loan.startDate,
        status: loan.status
      });
    }
  }, [loan]);

  // Duration options for the dropdown
  const durationOptions = [
    { label: '1 week', value: 1, unit: 'weeks' as const },
    { label: '2 weeks', value: 2, unit: 'weeks' as const },
    { label: '3 weeks', value: 3, unit: 'weeks' as const },
    { label: '4 weeks', value: 4, unit: 'weeks' as const },
    { label: '1 month', value: 1, unit: 'months' as const },
    { label: '2 months', value: 2, unit: 'months' as const },
    { label: '3 months', value: 3, unit: 'months' as const },
    { label: '6 months', value: 6, unit: 'months' as const },
    { label: '9 months', value: 9, unit: 'months' as const },
    { label: '12 months', value: 12, unit: 'months' as const },
  ];

  const calculateDueDate = (startDate: string, duration: LoanDuration) => {
    const start = new Date(startDate);
    const due = new Date(start);
    
    if (duration.unit === 'weeks') {
      due.setDate(due.getDate() + (duration.value * 7));
    } else {
      due.setMonth(due.getMonth() + duration.value);
    }
    
    return due.toISOString().split('T')[0];
  };

  const calculateLoanDetails = (principal: number, interestRate: number, interestType: string, duration: LoanDuration) => {
    let totalInterest = 0;
    let totalAmount = 0;
    let emi = 0;

    if (interestType === 'simple') {
      // Simple Interest: Total = Principal + (Principal × Rate)
      totalInterest = principal * (interestRate / 100);
      totalAmount = principal + totalInterest;
    } else {
      // Annual Interest: Total = Principal + (Principal × Rate × Time)
      let timeInYears = 0;
      if (duration.unit === 'weeks') {
        timeInYears = duration.value / 52;
      } else {
        timeInYears = duration.value / 12;
      }
      totalInterest = principal * (interestRate / 100) * timeInYears;
      totalAmount = principal + totalInterest;
    }

    // Calculate EMI based on duration
    const totalPeriods = duration.unit === 'weeks' ? duration.value : duration.value;
    emi = totalAmount / totalPeriods;

    return {
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      emi: Math.round(emi * 100) / 100
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const principal = parseFloat(formData.principal);
    const interestRate = parseFloat(formData.interestRate);
    
    if (isNaN(principal) || principal <= 0) {
      toast.error('Please enter a valid principal amount');
      return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }

    const borrower = borrowers.find(b => b.id === formData.borrowerId);
    if (!borrower) {
      toast.error('Please select a borrower');
      return;
    }

    // Convert duration to months for backward compatibility
    const termInMonths = formData.duration.unit === 'weeks' 
      ? Math.round((formData.duration.value * 7) / 30.44) // Average days per month
      : formData.duration.value;

    try {
      if (loan) {
        await updateLoan(loan.id, {
          borrowerId: formData.borrowerId,
          borrowerName: borrower.name,
          principal,
          interestRate,
          interestType: formData.interestType,
          duration: formData.duration,
          termInMonths,
          startDate: formData.startDate,
          dueDate: calculateDueDate(formData.startDate, formData.duration),
          status: formData.status
        });
        toast.success('Loan updated successfully');
      } else {
        await createLoan({
          borrowerId: formData.borrowerId,
          borrowerName: borrower.name,
          principal,
          interestRate,
          interestType: formData.interestType,
          duration: formData.duration,
          termInMonths,
          startDate: formData.startDate,
          dueDate: calculateDueDate(formData.startDate, formData.duration),
          status: formData.status
        });
        toast.success('Loan created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(loan ? 'Failed to update loan' : 'Failed to create loan');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (value: string) => {
    const option = durationOptions.find(opt => `${opt.value}-${opt.unit}` === value);
    if (option) {
      setFormData(prev => ({
        ...prev,
        duration: { value: option.value, unit: option.unit }
      }));
    }
  };

  // Calculate preview values
  const previewData = formData.principal && formData.interestRate 
    ? calculateLoanDetails(
        parseFloat(formData.principal), 
        parseFloat(formData.interestRate), 
        formData.interestType,
        formData.duration
      )
    : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loan ? 'Edit Loan' : 'Create New Loan'}
          </DialogTitle>
          <DialogDescription>
            {loan ? 'Update loan information' : 'Enter loan details to create a new loan'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="borrowerId">Borrower *</Label>
            <Select value={formData.borrowerId} onValueChange={(value) => handleChange('borrowerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a borrower" />
              </SelectTrigger>
              <SelectContent>
                {borrowers.filter(b => b.status === 'active').map((borrower) => (
                  <SelectItem key={borrower.id} value={borrower.id}>
                    {borrower.name} - {borrower.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount (ZMW) *</Label>
              <Input
                id="principal"
                type="number"
                step="0.01"
                min="0"
                value={formData.principal}
                onChange={(e) => handleChange('principal', e.target.value)}
                placeholder="Enter principal amount"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%) *</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.interestRate}
                onChange={(e) => handleChange('interestRate', e.target.value)}
                placeholder="Enter interest rate"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestType">Interest Type *</Label>
            <Select value={formData.interestType} onValueChange={(value) => handleChange('interestType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Interest</SelectItem>
                <SelectItem value="annual">Annual Interest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.interestType === 'simple' 
                ? 'Total = Principal + (Principal × Rate)'
                : 'Total = Principal + (Principal × Rate × Time)'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Loan Duration *</Label>
              <Select 
                value={`${formData.duration.value}-${formData.duration.unit}`} 
                onValueChange={handleDurationChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={`${option.value}-${option.unit}`} value={`${option.value}-${option.unit}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>
          
          {loan && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Loan Preview */}
          {previewData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-800">Loan Preview</CardTitle>
                <CardDescription className="text-blue-600">
                  Calculated using {formData.interestType} interest method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-blue-600">Due Date:</span>
                    <p className="font-medium">
                      {calculateDueDate(formData.startDate, formData.duration)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Duration:</span>
                    <p className="font-medium">
                      {formData.duration.value} {formData.duration.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Total Interest:</span>
                    <p className="font-medium">K{previewData.totalInterest.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-600">Total Amount:</span>
                    <p className="font-medium">K{previewData.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-blue-600">
                      {formData.duration.unit === 'weeks' ? 'Weekly' : 'Monthly'} Payment:
                    </span>
                    <p className="font-medium text-lg">K{previewData.emi.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (loan ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}