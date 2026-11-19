import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../common/EmptyState';

const DataTable = ({ 
  columns, 
  data = [], 
  keyField = 'id',
  title,
  actions,
  searchQuery = '',
  itemsPerPage = 10,
  emptyMessage = 'No data available'
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query (basic text search across all values)
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(val => 
        val !== null && val !== undefined && val.toString().toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 if data/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, data.length]);

  return (
    <div className="data-table-wrapper">
      {(title || actions) && (
        <div className="data-table-header">
          {title && <h3>{title}</h3>}
          {actions && <div className="data-table-actions">{actions}</div>}
        </div>
      )}
      
      {currentData.length > 0 ? (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ width: col.width }}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row) => (
                  <tr key={row[keyField]}>
                    {columns.map((col, index) => (
                      <td key={index}>
                        {col.render ? col.render(row) : row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="data-table-footer">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            
            {totalPages > 1 && (
              <div className="data-table-pagination">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    className={currentPage === i + 1 ? 'page-active' : ''}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState title={emptyMessage} description={searchQuery ? "Try adjusting your search query." : "No records found."} />
      )}
    </div>
  );
};

export default DataTable;
