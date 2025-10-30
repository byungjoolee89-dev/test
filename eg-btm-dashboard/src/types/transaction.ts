export interface Transaction {
  id: string;
  timestamp: number;
  service: string;
  url: string;
  responseTime: number;
  status: 'success' | 'slow' | 'error';
  httpStatus: number;
  method: string;
}

export interface TransactionStats {
  tps: number;
  avgResponseTime: number;
  errorRate: number;
  activeTransactions: number;
  slowTransactions: number;
}

export interface BTMData {
  transactions: Transaction[];
  stats: TransactionStats;
}
