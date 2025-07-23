import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  Menu,
  User,
  LogOut,
  Download,
  Upload,
  FileText,
  Wallet,
  HardDrive
} from 'lucide-react';
import { storageService } from '@/services/storage';
import { BalanceManager } from '@/components/admin/BalanceManager';
import { toast } from 'sonner';

export function Layout() {
  const { user, logout } = useAuth();
  const { accountBalance } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showBalanceManager, setShowBalanceManager] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleExportData = () => {
    try {
      const data = storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fortitude-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            if (storageService.importData(data)) {
              toast.success('Data imported successfully');
              window.location.reload();
            } else {
              toast.error('Failed to import data');
            }
          } catch (error) {
            toast.error('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Borrowers', href: '/borrowers', icon: Users },
    { name: 'Loans', href: '/loans', icon: CreditCard },
    { name: 'Payments', href: '/payments', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-indigo-600">Fortitude</h1>
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                        location.pathname === item.href
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Storage Mode Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <HardDrive className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Local Storage</span>
              </div>

              {/* Available Balance Display */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  K{accountBalance?.availableBalance.toLocaleString() || '0'}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="default" 
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowBalanceManager(true)}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Manage Balance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportData}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Storage Mode Indicator */}
              <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg mx-2 mb-2">
                <HardDrive className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Local Storage Mode</span>
              </div>

              {/* Mobile Balance Display */}
              <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 rounded-lg mx-2 mb-2">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Available: K{accountBalance?.availableBalance.toLocaleString() || '0'}
                </span>
              </div>
              
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Balance Manager Modal */}
      {showBalanceManager && (
        <BalanceManager onClose={() => setShowBalanceManager(false)} />
      )}
    </div>
  );
}