import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Target,
  Percent,
  Download,
  FileSpreadsheet,
  Share2,
  Loader2
} from 'lucide-react';
import { ReportData } from '@/types';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';

export function Reports() {
  const { generateReports, loading, loans, payments, accountBalance } = useApp();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await generateReports();
      setReportData(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const handleExportPDF = async () => {
    if (!reportData || !accountBalance) {
      toast.error('No data available for export');
      return;
    }

    setExportLoading('pdf');
    try {
      const pdfBlob = await exportService.exportToPDF(reportData, accountBalance);
      const filename = exportService.generateFilename('pdf');
      exportService.downloadBlob(pdfBlob, filename);
      toast.success('PDF report exported successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData || !accountBalance) {
      toast.error('No data available for export');
      return;
    }

    setExportLoading('excel');
    try {
      const excelBlob = await exportService.exportToExcel(reportData, accountBalance, loans, payments);
      const filename = exportService.generateFilename('xlsx');
      exportService.downloadBlob(excelBlob, filename);
      toast.success('Excel report exported successfully');
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Failed to export Excel report');
    } finally {
      setExportLoading(null);
    }
  };

  const handleShare = async () => {
    if (!reportData || !accountBalance) {
      toast.error('No data available for sharing');
      return;
    }

    setExportLoading('share');
    try {
      // Try to share PDF first, fallback to text summary
      const pdfBlob = await exportService.exportToPDF(reportData, accountBalance);
      const filename = exportService.generateFilename('pdf');
      
      const shared = await exportService.shareReport(
        pdfBlob, 
        filename, 
        'Fortitude Loan Management Report'
      );

      if (shared) {
        toast.success('Report shared successfully');
      } else {
        // Fallback: Share text summary with proper permission check
        const textSummary = exportService.generateTextSummary(reportData, accountBalance);
        
        if (navigator.share && navigator.canShare && navigator.canShare({ text: textSummary })) {
          await navigator.share({
            title: 'Fortitude Loan Management Report',
            text: textSummary
          });
          toast.success('Report summary shared');
        } else {
          // Final fallback: Download the PDF since sharing is not available
          exportService.downloadBlob(pdfBlob, filename);
          toast.info('Report downloaded - sharing not supported on this device');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      // If sharing fails, try to at least download the report
      try {
        const pdfBlob = await exportService.exportToPDF(reportData, accountBalance);
        const filename = exportService.generateFilename('pdf');
        exportService.downloadBlob(pdfBlob, filename);
        toast.info('Report downloaded - sharing failed but file saved locally');
      } catch (downloadError) {
        toast.error('Failed to share or download report');
      }
    } finally {
      setExportLoading(null);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const { outstandingLoans, pastDueLoans, borrowersReport, portfolioSummary } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive loan portfolio analysis and export</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={exportLoading === 'pdf'}
            className="flex items-center gap-2"
          >
            {exportLoading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export as PDF
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            disabled={exportLoading === 'excel'}
            className="flex items-center gap-2"
          >
            {exportLoading === 'excel' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Export as Excel
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleShare}
            disabled={exportLoading === 'share'}
            className="flex items-center gap-2"
          >
            {exportLoading === 'share' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            Share
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioSummary.totalBorrowers}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{portfolioSummary.totalAmountDisbursed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {portfolioSummary.totalLoansIssued} loans issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              K{portfolioSummary.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Amount to collect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accountBalance ? ((accountBalance.totalCollected / accountBalance.totalDisbursed) * 100 || 0).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">Recovery rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              K{accountBalance?.availableBalance.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Ready to lend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              K{accountBalance?.totalCollected.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {portfolioSummary.defaultRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Portfolio risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="outstanding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outstanding">Outstanding Loans</TabsTrigger>
          <TabsTrigger value="pastdue">Past Due Loans</TabsTrigger>
          <TabsTrigger value="borrowers">Borrowers Report</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Outstanding Loans ({outstandingLoans.length})
              </CardTitle>
              <CardDescription>All active loans with outstanding balances</CardDescription>
            </CardHeader>
            <CardContent>
              {outstandingLoans.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No outstanding loans</p>
              ) : (
                <div className="space-y-4">
                  {outstandingLoans.map((loan) => {
                    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
                    return (
                      <div key={loan.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold">{loan.borrowerName}</h4>
                          <p className="text-sm text-gray-600">
                            Principal: K{loan.principal.toLocaleString()} • 
                            Rate: {loan.interestRate}% ({loan.interestType || 'Simple'}) • 
                            Duration: {duration.value} {duration.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(loan.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            K{loan.outstandingAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Paid: K{loan.paidAmount.toLocaleString()}
                          </p>
                          <Badge variant={loan.status === 'active' ? 'default' : 'destructive'}>
                            {loan.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pastdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Past Due Loans ({pastDueLoans.length})
              </CardTitle>
              <CardDescription>Loans that have exceeded their due dates</CardDescription>
            </CardHeader>
            <CardContent>
              {pastDueLoans.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No past due loans</p>
              ) : (
                <div className="space-y-4">
                  {pastDueLoans.map((loan) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
                    return (
                      <div key={loan.id} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <h4 className="font-semibold text-red-800">{loan.borrowerName}</h4>
                          <p className="text-sm text-red-600">
                            Principal: K{loan.principal.toLocaleString()} • 
                            Rate: {loan.interestRate}% ({loan.interestType || 'Simple'}) • 
                            Duration: {duration.value} {duration.unit}
                          </p>
                          <p className="text-xs text-red-500">
                            Due: {new Date(loan.dueDate).toLocaleDateString()} 
                            ({daysOverdue} days overdue)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-700">
                            K{loan.outstandingAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-red-600">
                            Paid: K{loan.paidAmount.toLocaleString()}
                          </p>
                          <Badge variant="destructive">Overdue</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Borrowers Report ({borrowersReport.length})
              </CardTitle>
              <CardDescription>Complete borrower portfolio analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {borrowersReport.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No borrowers found</p>
              ) : (
                <div className="space-y-6">
                  {borrowersReport.map((report) => (
                    <div key={report.borrower.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{report.borrower.name}</h4>
                          <p className="text-sm text-gray-600">{report.borrower.phone}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(report.borrower.joiningDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={report.borrower.status === 'active' ? 'default' : 'secondary'}
                          className={report.borrower.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {report.borrower.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">
                            K{report.totalBorrowed.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Total Borrowed</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-lg font-bold text-green-600">
                            K{report.totalPaid.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Total Paid</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-lg font-bold text-red-600">
                            K{report.currentOutstanding.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Outstanding</p>
                        </div>
                      </div>

                      {report.loans.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Loan History ({report.loans.length})</h5>
                          <div className="space-y-2">
                            {report.loans.map((loan) => {
                              const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
                              return (
                                <div key={loan.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                  <div>
                                    <span className="font-medium">K{loan.principal.toLocaleString()}</span>
                                    <span className="text-gray-500 ml-2">
                                      {loan.interestRate}% • {duration.value} {duration.unit}
                                    </span>
                                    <span className="text-gray-400 ml-2">
                                      ({loan.interestType || 'Simple'})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                      K{loan.outstandingAmount.toLocaleString()} due
                                    </span>
                                    <Badge 
                                      variant={
                                        loan.status === 'active' ? 'default' :
                                        loan.status === 'completed' ? 'secondary' :
                                        'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {loan.status}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}