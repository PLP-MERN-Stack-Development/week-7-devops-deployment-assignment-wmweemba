import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Borrower } from '@/types';
import { toast } from 'sonner';

interface BorrowerFormProps {
  borrower?: Borrower | null;
  onClose: () => void;
}

export function BorrowerForm({ borrower, onClose }: BorrowerFormProps) {
  const { createBorrower, updateBorrower, loading } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (borrower) {
      setFormData({
        name: borrower.name,
        phone: borrower.phone,
        address: borrower.address,
        email: borrower.email || '',
        joiningDate: borrower.joiningDate.split('T')[0],
        status: borrower.status
      });
    }
  }, [borrower]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (borrower) {
        await updateBorrower(borrower.id, {
          ...formData,
          joiningDate: formData.joiningDate + 'T00:00:00.000Z'
        });
        toast.success('Borrower updated successfully');
      } else {
        await createBorrower({
          ...formData,
          joiningDate: formData.joiningDate + 'T00:00:00.000Z'
        });
        toast.success('Borrower created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(borrower ? 'Failed to update borrower' : 'Failed to create borrower');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {borrower ? 'Edit Borrower' : 'Add New Borrower'}
          </DialogTitle>
          <DialogDescription>
            {borrower ? 'Update borrower information' : 'Enter borrower details to add them to your system'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter complete address"
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="joiningDate">Joining Date *</Label>
            <Input
              id="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => handleChange('joiningDate', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (borrower ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}