import React from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`search-bar ${className}`}>
      <Search size={18} className="search-bar-icon" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
