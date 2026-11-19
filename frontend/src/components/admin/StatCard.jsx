import React from 'react';
import { Activity } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon = Activity, 
  color = 'blue' // blue, green, orange, red, cyan
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-card-info">
        <div className="stat-card-label">{title}</div>
        <div className="stat-card-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
