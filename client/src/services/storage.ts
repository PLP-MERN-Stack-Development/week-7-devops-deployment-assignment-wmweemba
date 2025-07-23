class StorageService {
  private prefix = 'fortitude_';

  set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${this.prefix}${key}`, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Complete data wipe - removes everything
  wipeAllData(): void {
    this.clear();
    console.log('All Fortitude data has been completely wiped from storage');
  }

  exportData(): string {
    const data = {
      borrowers: this.get('borrowers') || [],
      loans: this.get('loans') || [],
      payments: this.get('payments') || [],
      users: this.get('users') || [],
      accountBalance: this.get('accountBalance') || null,
      balanceTransactions: this.get('balanceTransactions') || [],
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.borrowers) this.set('borrowers', data.borrowers);
      if (data.loans) this.set('loans', data.loans);
      if (data.payments) this.set('payments', data.payments);
      if (data.users) this.set('users', data.users);
      if (data.accountBalance) this.set('accountBalance', data.accountBalance);
      if (data.balanceTransactions) this.set('balanceTransactions', data.balanceTransactions);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();