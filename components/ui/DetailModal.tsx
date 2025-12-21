'use client';

import { X, Image as ImageIcon } from 'lucide-react';
import { clientGridColumnConfig } from '@/types/gridTypes';
import { useState } from 'react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  columns: clientGridColumnConfig[];
  title?: string;
}

export function DetailModal({
  isOpen,
  onClose,
  data,
  columns,
  title = 'Details',
}: DetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const formatValue = (config: clientGridColumnConfig, value: any) => {
    if (value === null || value === undefined || value === '') {
      return config.fallBackValue ?? '-';
    }

    switch (config.type) {
      case 'date':
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  };

  // Get logo URL from nested path
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Get logo URL - check common paths
  const logoUrl = 
    data?.client_details?.logo_url || 
    data?.logo_url || 
    getNestedValue(data, 'client_details.logo_url');

  // Filter out actions column from display
  const displayColumns = columns.filter(col => col.id !== 'actions');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Logo Image Viewer */}
            {logoUrl && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Logo</h3>
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {!imageError ? (
                    <img
                      src={logoUrl}
                      alt="Client Logo"
                      className="max-w-full max-h-64 object-contain rounded"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                      <ImageIcon size={48} className="mb-2" />
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Details List */}
            <dl className="space-y-4">
              {displayColumns.map((column) => {
                // Handle nested paths
                const keys = column.accessorKey.split('.');
                let value = data;
                for (const key of keys) {
                  value = value?.[key];
                }

                // Skip logo_url as it's displayed separately
                if (column.accessorKey.includes('logo_url')) {
                  return null;
                }

                return (
                  <div key={column.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      {column.header}
                    </dt>
                    <dd className="text-base text-gray-900">
                      {formatValue(column, value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}