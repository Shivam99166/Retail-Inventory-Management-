import React from 'react';
import { Package } from 'lucide-react';

function UserFooter() {
  return (
    <footer className="user-footer">
      <div className="user-footer-container">
        <div className="user-footer-brand">
          <Package size={18} />
          <span>RetailHub</span>
        </div>
        <p className="user-footer-copy">
          &copy; {new Date().getFullYear()} RetailHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default UserFooter;
