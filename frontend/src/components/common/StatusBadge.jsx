import React from 'react';

const StatusBadge = ({ type, text, className = '' }) => {
  // Common types: success, warning, danger, info, primary, secondary
  // Can be mapped to specific statuses:
  // - PENDING: warning
  // - CONFIRMED: info
  // - PROCESSING: primary
  // - SHIPPED: secondary
  // - DELIVERED: success
  // - CANCELLED: danger

  let badgeType = type || 'secondary';

  // Map known string statuses to colors if type isn't explicitly provided
  if (!type && text) {
    const textLower = text.toString().toLowerCase();
    if (['delivered', 'active', 'completed', 'received'].includes(textLower)) badgeType = 'success';
    if (['pending', 'low stock', 'draft'].includes(textLower)) badgeType = 'warning';
    if (['cancelled', 'out of stock', 'inactive'].includes(textLower)) badgeType = 'danger';
    if (['confirmed', 'approved'].includes(textLower)) badgeType = 'info';
    if (['processing', 'shipped', 'requested'].includes(textLower)) badgeType = 'primary';
  }

  return (
    <span className={`badge badge-${badgeType} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
