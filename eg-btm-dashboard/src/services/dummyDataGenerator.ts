import { Transaction, TransactionStats, BTMData } from '../types/transaction';

const SERVICES = [
  '/api/users',
  '/api/orders',
  '/api/products',
  '/api/checkout',
  '/api/payment',
  '/api/search',
  '/api/inventory',
  '/api/auth/login',
  '/api/cart',
  '/api/shipping'
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

export class DummyDataGenerator {
  private transactionCounter = 0;
  private recentTransactions: Transaction[] = [];
  private readonly maxTransactions = 100;

  generateTransaction(): Transaction {
    this.transactionCounter++;

    // 90% success, 7% slow, 3% error
    const rand = Math.random();
    let status: 'success' | 'slow' | 'error';
    let responseTime: number;
    let httpStatus: number;

    if (rand < 0.03) {
      status = 'error';
      responseTime = Math.floor(Math.random() * 2000) + 1000;
      httpStatus = [500, 503, 504][Math.floor(Math.random() * 3)];
    } else if (rand < 0.10) {
      status = 'slow';
      responseTime = Math.floor(Math.random() * 3000) + 2000;
      httpStatus = 200;
    } else {
      status = 'success';
      responseTime = Math.floor(Math.random() * 800) + 50;
      httpStatus = 200;
    }

    return {
      id: `tx-${this.transactionCounter}-${Date.now()}`,
      timestamp: Date.now(),
      service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
      url: SERVICES[Math.floor(Math.random() * SERVICES.length)],
      responseTime,
      status,
      httpStatus,
      method: HTTP_METHODS[Math.floor(Math.random() * HTTP_METHODS.length)]
    };
  }

  generateBatch(count: number): Transaction[] {
    const transactions: Transaction[] = [];
    for (let i = 0; i < count; i++) {
      transactions.push(this.generateTransaction());
    }
    return transactions;
  }

  addTransaction(transaction: Transaction): void {
    this.recentTransactions.push(transaction);

    // Keep only recent transactions
    if (this.recentTransactions.length > this.maxTransactions) {
      this.recentTransactions = this.recentTransactions.slice(-this.maxTransactions);
    }
  }

  calculateStats(transactions: Transaction[], timeWindow: number = 60000): TransactionStats {
    const now = Date.now();
    const recentTx = transactions.filter(tx => now - tx.timestamp < timeWindow);

    if (recentTx.length === 0) {
      return {
        tps: 0,
        avgResponseTime: 0,
        errorRate: 0,
        activeTransactions: 0,
        slowTransactions: 0
      };
    }

    const timeWindowSeconds = timeWindow / 1000;
    const tps = recentTx.length / timeWindowSeconds;

    const totalResponseTime = recentTx.reduce((sum, tx) => sum + tx.responseTime, 0);
    const avgResponseTime = totalResponseTime / recentTx.length;

    const errorCount = recentTx.filter(tx => tx.status === 'error').length;
    const errorRate = (errorCount / recentTx.length) * 100;

    const activeTransactions = recentTx.filter(tx => now - tx.timestamp < 5000).length;
    const slowTransactions = recentTx.filter(tx => tx.status === 'slow').length;

    return {
      tps: parseFloat(tps.toFixed(2)),
      avgResponseTime: parseFloat(avgResponseTime.toFixed(0)),
      errorRate: parseFloat(errorRate.toFixed(2)),
      activeTransactions,
      slowTransactions
    };
  }

  getBTMData(): BTMData {
    return {
      transactions: this.recentTransactions,
      stats: this.calculateStats(this.recentTransactions)
    };
  }

  getRecentTransactions(): Transaction[] {
    return this.recentTransactions;
  }
}

export const dataGenerator = new DummyDataGenerator();
