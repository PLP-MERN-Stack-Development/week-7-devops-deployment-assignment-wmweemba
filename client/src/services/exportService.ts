import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReportData, Loan, Payment, Borrower, AccountBalance } from '@/types';

export class ExportService {
  private formatCurrency(amount: number): string {
    return `K${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatDuration(loan: Loan): string {
    const duration = loan.duration || { value: loan.termInMonths, unit: 'months' };
    return `${duration.value} ${duration.unit}`;
  }

  // PDF Export Functions
  async exportToPDF(reportData: ReportData, accountBalance: AccountBalance): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Fortitude Loan Management System', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${this.formatDate(new Date().toISOString())}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Summary Statistics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Portfolio Summary', 14, yPosition);
    yPosition += 10;

    const summaryData = [
      ['Available Balance', this.formatCurrency(accountBalance.availableBalance)],
      ['Total Disbursed', this.formatCurrency(accountBalance.totalDisbursed)],
      ['Total Collected', this.formatCurrency(accountBalance.totalCollected)],
      ['Outstanding Amount', this.formatCurrency(accountBalance.totalOutstanding)],
      ['Total Borrowers', reportData.portfolioSummary.totalBorrowers.toString()],
      ['Total Active Loans', reportData.outstandingLoans.length.toString()],
      ['Collection Rate', `${((accountBalance.totalCollected / accountBalance.totalDisbursed) * 100 || 0).toFixed(1)}%`],
      ['Default Rate', `${reportData.portfolioSummary.defaultRate.toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Outstanding Loans Section
    if (reportData.outstandingLoans.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Outstanding Loans (${reportData.outstandingLoans.length})`, 14, yPosition);
      yPosition += 10;

      const outstandingData = reportData.outstandingLoans.map(loan => [
        loan.borrowerName,
        this.formatCurrency(loan.principal),
        `${loan.interestRate}%`,
        this.formatDuration(loan),
        this.formatCurrency(loan.outstandingAmount),
        this.formatDate(loan.dueDate),
        loan.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Borrower', 'Principal', 'Rate', 'Duration', 'Outstanding', 'Due Date', 'Status']],
        body: outstandingData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Past Due Loans Section
    if (reportData.pastDueLoans.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Past Due Loans (${reportData.pastDueLoans.length})`, 14, yPosition);
      yPosition += 10;

      const pastDueData = reportData.pastDueLoans.map(loan => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return [
          loan.borrowerName,
          this.formatCurrency(loan.principal),
          this.formatCurrency(loan.outstandingAmount),
          this.formatDate(loan.dueDate),
          `${daysOverdue} days`,
          loan.status.toUpperCase()
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Borrower', 'Principal', 'Outstanding', 'Due Date', 'Overdue', 'Status']],
        body: pastDueData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Check if we need a new page for borrowers report
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Borrowers Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Borrowers Summary (${reportData.borrowersReport.length})`, 14, yPosition);
    yPosition += 10;

    const borrowersData = reportData.borrowersReport.map(report => [
      report.borrower.name,
      report.borrower.phone,
      report.loans.length.toString(),
      this.formatCurrency(report.totalBorrowed),
      this.formatCurrency(report.totalPaid),
      this.formatCurrency(report.currentOutstanding),
      report.borrower.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Phone', 'Loans', 'Total Borrowed', 'Total Paid', 'Outstanding', 'Status']],
      body: borrowersData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 }
    });

    return doc.output('blob');
  }

  // Excel Export Functions
  async exportToExcel(reportData: ReportData, accountBalance: AccountBalance, loans: Loan[], payments: Payment[]): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Fortitude Loan Management System'],
      [`Report Generated: ${this.formatDate(new Date().toISOString())}`],
      [''],
      ['Portfolio Summary'],
      ['Metric', 'Value'],
      ['Available Balance', this.formatCurrency(accountBalance.availableBalance)],
      ['Total Disbursed', this.formatCurrency(accountBalance.totalDisbursed)],
      ['Total Collected', this.formatCurrency(accountBalance.totalCollected)],
      ['Outstanding Amount', this.formatCurrency(accountBalance.totalOutstanding)],
      ['Total Borrowers', reportData.portfolioSummary.totalBorrowers],
      ['Total Active Loans', reportData.outstandingLoans.length],
      ['Collection Rate', `${((accountBalance.totalCollected / accountBalance.totalDisbursed) * 100 || 0).toFixed(1)}%`],
      ['Default Rate', `${reportData.portfolioSummary.defaultRate.toFixed(1)}%`]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Outstanding Loans Sheet
    if (reportData.outstandingLoans.length > 0) {
      const outstandingHeaders = [
        'Borrower Name', 'Principal', 'Interest Rate', 'Interest Type', 'Duration', 
        'Outstanding Amount', 'Paid Amount', 'Due Date', 'Status', 'Start Date'
      ];
      
      const outstandingData = reportData.outstandingLoans.map(loan => [
        loan.borrowerName,
        loan.principal,
        `${loan.interestRate}%`,
        loan.interestType || 'Simple',
        this.formatDuration(loan),
        loan.outstandingAmount,
        loan.paidAmount,
        this.formatDate(loan.dueDate),
        loan.status.toUpperCase(),
        this.formatDate(loan.startDate)
      ]);

      const outstandingSheet = XLSX.utils.aoa_to_sheet([outstandingHeaders, ...outstandingData]);
      XLSX.utils.book_append_sheet(workbook, outstandingSheet, 'Outstanding Loans');
    }

    // Past Due Loans Sheet
    if (reportData.pastDueLoans.length > 0) {
      const pastDueHeaders = [
        'Borrower Name', 'Principal', 'Outstanding Amount', 'Due Date', 
        'Days Overdue', 'Status', 'Interest Rate'
      ];
      
      const pastDueData = reportData.pastDueLoans.map(loan => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return [
          loan.borrowerName,
          loan.principal,
          loan.outstandingAmount,
          this.formatDate(loan.dueDate),
          daysOverdue,
          loan.status.toUpperCase(),
          `${loan.interestRate}%`
        ];
      });

      const pastDueSheet = XLSX.utils.aoa_to_sheet([pastDueHeaders, ...pastDueData]);
      XLSX.utils.book_append_sheet(workbook, pastDueSheet, 'Past Due Loans');
    }

    // Borrowers Report Sheet
    const borrowersHeaders = [
      'Name', 'Phone', 'Address', 'Email', 'Joining Date', 'Status',
      'Total Loans', 'Total Borrowed', 'Total Paid', 'Current Outstanding'
    ];
    
    const borrowersData = reportData.borrowersReport.map(report => [
      report.borrower.name,
      report.borrower.phone,
      report.borrower.address,
      report.borrower.email || '',
      this.formatDate(report.borrower.joiningDate),
      report.borrower.status.toUpperCase(),
      report.loans.length,
      report.totalBorrowed,
      report.totalPaid,
      report.currentOutstanding
    ]);

    const borrowersSheet = XLSX.utils.aoa_to_sheet([borrowersHeaders, ...borrowersData]);
    XLSX.utils.book_append_sheet(workbook, borrowersSheet, 'Borrowers Report');

    // All Loans Sheet
    const loansHeaders = [
      'Loan ID', 'Borrower Name', 'Principal', 'Interest Rate', 'Interest Type',
      'Duration', 'Start Date', 'Due Date', 'Status', 'EMI', 'Total Amount',
      'Outstanding Amount', 'Paid Amount', 'Created Date'
    ];
    
    const loansData = loans.map(loan => [
      loan.id,
      loan.borrowerName,
      loan.principal,
      `${loan.interestRate}%`,
      loan.interestType || 'Simple',
      this.formatDuration(loan),
      this.formatDate(loan.startDate),
      this.formatDate(loan.dueDate),
      loan.status.toUpperCase(),
      loan.emi,
      loan.totalAmount,
      loan.outstandingAmount,
      loan.paidAmount,
      this.formatDate(loan.createdAt)
    ]);

    const loansSheet = XLSX.utils.aoa_to_sheet([loansHeaders, ...loansData]);
    XLSX.utils.book_append_sheet(workbook, loansSheet, 'All Loans');

    // Payments Sheet
    const paymentsHeaders = [
      'Payment ID', 'Loan ID', 'Borrower Name', 'Amount', 'Payment Date',
      'Payment Type', 'Description', 'Created Date'
    ];
    
    const paymentsData = payments.map(payment => {
      const loan = loans.find(l => l.id === payment.loanId);
      return [
        payment.id,
        payment.loanId,
        loan?.borrowerName || 'Unknown',
        payment.amount,
        this.formatDate(payment.paymentDate),
        payment.paymentType.toUpperCase(),
        payment.description || '',
        this.formatDate(payment.createdAt)
      ];
    });

    const paymentsSheet = XLSX.utils.aoa_to_sheet([paymentsHeaders, ...paymentsData]);
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'All Payments');

    // Convert to blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Device Sharing Functions
  async shareReport(blob: Blob, filename: string, title: string): Promise<boolean> {
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: 'Loan management report from Fortitude LMS',
            files: [file]
          });
          return true;
        }
      } catch (error) {
        console.error('Error sharing file:', error);
      }
    }
    
    // Fallback: Download the file
    this.downloadBlob(blob, filename);
    return false;
  }

  // Utility function to download blob
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate filename with current date
  generateFilename(type: 'pdf' | 'xlsx'): string {
    const date = new Date().toISOString().split('T')[0];
    return `fortitude_report_${date}.${type}`;
  }

  // Generate text summary for sharing
  generateTextSummary(reportData: ReportData, accountBalance: AccountBalance): string {
    return `
Fortitude Loan Management Report
Generated: ${this.formatDate(new Date().toISOString())}

Portfolio Summary:
• Available Balance: ${this.formatCurrency(accountBalance.availableBalance)}
• Total Disbursed: ${this.formatCurrency(accountBalance.totalDisbursed)}
• Total Collected: ${this.formatCurrency(accountBalance.totalCollected)}
• Outstanding Amount: ${this.formatCurrency(accountBalance.totalOutstanding)}
• Total Borrowers: ${reportData.portfolioSummary.totalBorrowers}
• Active Loans: ${reportData.outstandingLoans.length}
• Past Due Loans: ${reportData.pastDueLoans.length}
• Collection Rate: ${((accountBalance.totalCollected / accountBalance.totalDisbursed) * 100 || 0).toFixed(1)}%

Generated by Fortitude Loan Management System
    `.trim();
  }
}

export const exportService = new ExportService();