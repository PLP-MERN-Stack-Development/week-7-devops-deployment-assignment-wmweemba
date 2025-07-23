import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Edit, Trash2, Eye } from 'lucide-react';
import { BorrowerForm } from '@/components/borrowers/BorrowerForm';
import { BorrowerDetails } from '@/components/borrowers/BorrowerDetails';
import { Borrower } from '@/types';
import { toast } from 'sonner';

export function Borrowers() {
  const { borrowers, deleteBorrower, loans } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredBorrowers = borrowers.filter(borrower =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.phone.includes(searchTerm) ||
    borrower.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (borrower: Borrower) => {
    // Check if borrower has any loans
    const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
    
    if (borrowerLoans.length > 0) {
      const hasActiveLoans = borrowerLoans.some(loan => loan.status === 'active');
      
      if (hasActiveLoans) {
        toast.error('Cannot delete borrower with active loans. Please close all active loans first.');
        return;
      }
      
      // If borrower has completed loans, ask for confirmation
      const confirmMessage = `${borrower.name} has ${borrowerLoans.length} completed loan(s). Are you sure you want to delete this borrower and all their loan history?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else {
      // Standard confirmation for borrowers with no loans
      if (!window.confirm(`Are you sure you want to delete ${borrower.name}?`)) {
        return;
      }
    }
    
    try {
      await deleteBorrower(borrower.id);
      toast.success('Borrower deleted successfully');
    } catch (error) {
      toast.error('Failed to delete borrower');
    }
  };

  const handleEdit = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setShowForm(true);
  };

  const handleView = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBorrower(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedBorrower(null);
  };

  const canDeleteBorrower = (borrower: Borrower) => {
    const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
    const hasActiveLoans = borrowerLoans.some(loan => loan.status === 'active');
    return !hasActiveLoans; // Can delete if no active loans
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowers</h1>
          <p className="text-gray-600 mt-1">Manage your borrower database</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Borrower
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <CardTitle>All Borrowers ({borrowers.length})</CardTitle>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search borrowers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBorrowers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {borrowers.length === 0 ? 'No borrowers yet' : 'No borrowers match your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBorrowers.map((borrower) => {
                const canDelete = canDeleteBorrower(borrower);
                const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
                const hasCompletedLoans = borrowerLoans.some(loan => loan.status === 'completed');
                
                return (
                  <div key={borrower.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{borrower.name}</h3>
                        <p className="text-sm text-gray-600">{borrower.phone}</p>
                      </div>
                      <Badge 
                        variant={borrower.status === 'active' ? 'default' : 'secondary'}
                        className={borrower.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {borrower.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">{borrower.address}</p>
                      <div className="flex justify-between text-sm">
                        <span>Total Loans:</span>
                        <span className="font-medium">{borrower.totalLoans}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Outstanding:</span>
                        <span className="font-medium text-red-600">
                          K{borrower.totalOutstanding.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(borrower)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(borrower)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(borrower)}
                        className={`${canDelete ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'}`}
                        title={canDelete ? 'Delete borrower' : hasCompletedLoans ? 'Delete borrower and loan history' : 'Cannot delete - has active loans'}
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

      {/* Borrower Form Modal */}
      {showForm && (
        <BorrowerForm
          borrower={editingBorrower}
          onClose={handleFormClose}
        />
      )}

      {/* Borrower Details Modal */}
      {showDetails && selectedBorrower && (
        <BorrowerDetails
          borrower={selectedBorrower}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
}