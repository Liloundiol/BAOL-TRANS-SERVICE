import React from 'react';
import type { ReactNode } from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  color = 'primary'
}) => {
  return (
    <div className={`stats-card color-${color}`}>
      <div className="stats-card-header">
        <h3 className="stats-card-title">{title}</h3>
        <div className="stats-card-icon">{icon}</div>
      </div>
      <div className="stats-card-body">
        <div className="stats-card-value">{value}</div>
        {trend && (
          <div className={`stats-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="trend-label">depuis hier</span>
          </div>
        )}
      </div>
    </div>
  );
};
