import React from 'react';

const StockStatus = ({ availableStock, reorderLevel }) => {
  let statusClass = 'in-stock';
  let statusText = 'IN STOCK';

  if (availableStock <= 0) {
    statusClass = 'out-of-stock';
    statusText = 'OUT OF STOCK';
  } else if (availableStock <= reorderLevel) {
    statusClass = 'low-stock';
    statusText = 'LOW STOCK';
  }

  return (
    <div className={`stock-status ${statusClass}`}>
      <div className="stock-status-dot"></div>
      <span>{statusText}</span>
    </div>
  );
};

export default StockStatus;
