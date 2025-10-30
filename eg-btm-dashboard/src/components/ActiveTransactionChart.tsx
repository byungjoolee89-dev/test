import React, { useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../types/transaction';
import { format } from 'date-fns';

interface ActiveTransactionChartProps {
  transactions: Transaction[];
}

const ActiveTransactionChart: React.FC<ActiveTransactionChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // 최근 60초 데이터만 표시
  const now = Date.now();
  const recentTransactions = transactions.filter(tx => now - tx.timestamp < 60000);

  // 차트 데이터 변환
  const chartData = recentTransactions.map(tx => ({
    x: tx.timestamp,
    y: tx.responseTime,
    status: tx.status,
    service: tx.service,
    id: tx.id,
    method: tx.method,
    httpStatus: tx.httpStatus
  }));

  const getColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10b981'; // green
      case 'slow':
        return '#f59e0b'; // orange
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.service}</p>
          <p className="tooltip-item">Method: {data.method}</p>
          <p className="tooltip-item">Response Time: {data.y}ms</p>
          <p className="tooltip-item">Status: {data.httpStatus}</p>
          <p className="tooltip-item">Time: {format(new Date(data.x), 'HH:mm:ss')}</p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  return (
    <div className="chart-container" ref={chartRef}>
      <div className="chart-header">
        <h2>실시간 액티브 서비스 모니터링</h2>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            정상
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
            느림 (&gt;2s)
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            에러
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            name="time"
            domain={[now - 60000, now]}
            tickFormatter={formatXAxis}
            stroke="#6b7280"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="response time"
            unit="ms"
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={chartData}
            fill="#8884d8"
            isAnimationActive={true}
            animationDuration={300}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="transaction-count">
        총 {recentTransactions.length}개 트랜잭션 (최근 60초)
      </div>
    </div>
  );
};

export default ActiveTransactionChart;
