import React, { useState, useEffect } from 'react';
import ActiveTransactionChart from './ActiveTransactionChart';
import StatisticsWidget from './StatisticsWidget';
import { Transaction, TransactionStats } from '../types/transaction';
import { dataGenerator } from '../services/dummyDataGenerator';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    tps: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeTransactions: 0,
    slowTransactions: 0
  });

  useEffect(() => {
    // 초기 트랜잭션 생성
    const initialTransactions = dataGenerator.generateBatch(20);
    initialTransactions.forEach(tx => dataGenerator.addTransaction(tx));

    // 실시간 트랜잭션 생성 (500ms ~ 2000ms 간격으로 랜덤하게)
    const generateTransaction = () => {
      // 한 번에 1-3개의 트랜잭션 생성 (TPS 시뮬레이션)
      const count = Math.floor(Math.random() * 3) + 1;
      const newTransactions = dataGenerator.generateBatch(count);
      newTransactions.forEach(tx => dataGenerator.addTransaction(tx));

      const btmData = dataGenerator.getBTMData();
      setTransactions([...btmData.transactions]);
      setStats(btmData.stats);

      // 다음 생성 시간 설정 (500ms ~ 2000ms)
      const nextInterval = Math.random() * 1500 + 500;
      setTimeout(generateTransaction, nextInterval);
    };

    // 첫 트랜잭션 생성 시작
    const timeout = setTimeout(generateTransaction, 1000);

    // 통계 업데이트 (1초마다)
    const statsInterval = setInterval(() => {
      const btmData = dataGenerator.getBTMData();
      setTransactions([...btmData.transactions]);
      setStats(btmData.stats);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>eG Enterprise BTM Dashboard</h1>
        <p className="subtitle">Tomcat Business Transaction Monitoring</p>
      </header>

      <StatisticsWidget stats={stats} />

      <ActiveTransactionChart transactions={transactions} />

      <footer className="dashboard-footer">
        <p>
          Powered by eG Enterprise REST API |
          Last Update: {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
