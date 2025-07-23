import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface BalanceManagerProps {
  onClose: () => void;
}

export function BalanceManager({ onClose }: BalanceManagerProps) {
  const { accountBalance, updateAvailableBalance, balanceTransactions, loading } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await updateAvailableBalance(numAmount, description || 'Balance update');
      toast.success('Available balance updated successfully');
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const recentTransactions = balanceTransactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Account Balance Management
          </DialogTitle>
          <DialogDescription>
            Manage your available loan capital and view transaction history
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Balance Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  K{accountBalance?.availableBalance.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">Ready to lend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  K{accountBalance?.totalOutstanding.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">Amount to collect</p>
              </CardContent>
            </Card>
          </div>

          {/* Update Balance Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Available Balance</CardTitle>
              <CardDescription>Set the current amount available for lending</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">New Available Balance (ZMW) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter new balance amount"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description for this balance update"
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Balance'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Latest balance movements</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const isPositive = transaction.type === 'deposit' || transaction.type === 'collection';
                    const Icon = isPositive ? TrendingUp : TrendingDown;
                    
                    return (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                          <div>
                            <p className="font-medium text-sm capitalize">{transaction.type}</p>
                            <p className="text-xs text-gray-500">{transaction.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}K{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: K{transaction.balanceAfter.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}