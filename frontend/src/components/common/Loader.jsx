import React from 'react';

const Loader = ({ size = 'md', inline = false, text = 'Loading...' }) => {
  const spinnerClass = `loader-spinner ${size !== 'md' ? `loader-spinner-${size}` : ''}`;
  
  if (inline) {
    return (
      <div className="loader-inline">
        <div className={spinnerClass}></div>
        {text && <span className="loader-text">{text}</span>}
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className={spinnerClass}></div>
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

export default Loader;
