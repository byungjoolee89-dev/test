import React from 'react';
import { TransactionStats } from '../types/transaction';

interface StatisticsWidgetProps {
  stats: TransactionStats;
}

const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-label">TPS</div>
        <div className="stat-value">{stats.tps.toFixed(2)}</div>
        <div className="stat-description">Transactions/sec</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">평균 응답시간</div>
        <div className="stat-value">{stats.avgResponseTime}</div>
        <div className="stat-description">milliseconds</div>
      </div>

      <div className="stat-card error">
        <div className="stat-label">에러율</div>
        <div className="stat-value">{stats.errorRate.toFixed(2)}%</div>
        <div className="stat-description">last 60 seconds</div>
      </div>

      <div className="stat-card active">
        <div className="stat-label">활성 트랜잭션</div>
        <div className="stat-value">{stats.activeTransactions}</div>
        <div className="stat-description">현재 진행중</div>
      </div>

      <div className="stat-card slow">
        <div className="stat-label">느린 트랜잭션</div>
        <div className="stat-value">{stats.slowTransactions}</div>
        <div className="stat-description">last 60 seconds</div>
      </div>
    </div>
  );
};

export default StatisticsWidget;
