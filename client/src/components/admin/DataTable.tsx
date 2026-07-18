import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './DataTable.css';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortAccessor?: (row: T) => string | number; // Used for sorting if accessor returns a ReactNode
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyField, 
  actions,
  emptyMessage = "Aucune donnée trouvée"
}: DataTableProps<T>) {
  const [sortColIndex, setSortColIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (index: number, col: Column<T>) => {
    if (col.sortable === false) return;
    
    if (sortColIndex === index) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColIndex(index);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (sortColIndex === null) return data;
    
    const col = columns[sortColIndex];
    return [...data].sort((a, b) => {
      let valA: any;
      let valB: any;
      
      if (col.sortAccessor) {
        valA = col.sortAccessor(a);
        valB = col.sortAccessor(b);
      } else if (typeof col.accessor === 'function') {
        valA = col.accessor(a);
      } else {
        valA = a[col.accessor];
      }
      
      if (typeof col.accessor === 'function' && !col.sortAccessor) {
          valB = col.accessor(b);
      } else if (!col.sortAccessor) {
          valB = b[col.accessor as keyof T];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColIndex, sortDirection, columns]);

  if (data.length === 0) {
    return (
      <div className="datatable-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="datatable-container">
      <table className="datatable">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                style={{ 
                  width: col.width, 
                  textAlign: col.align || 'left',
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
                onClick={() => handleSort(index, col)}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  {col.header}
                  {sortColIndex === index && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
            {actions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((col, index) => (
                <td 
                  key={index}
                  style={{ textAlign: col.align || 'left' }}
                  data-label={col.header}
                >
                  {typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : String(row[col.accessor as keyof T])}
                </td>
              ))}
              {actions && (
                <td className="datatable-actions" style={{ textAlign: 'right' }} data-label="Actions">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
