'use client';

import { useState } from 'react';
import { DataGrid } from '@/components/ui/DataGrid';
import { clientGridConfig, Client } from './clientGridUtils';
import { Edit, Eye } from 'lucide-react';
import { DetailModal } from '../ui/DetailModal';

interface ClientGridProps {
  clients: Client[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onEdit?: (client: Client) => void;
}

export function ClientGrid({
  clients,
  hasMore,
  isLoading,
  onLoadMore,
  onEdit,
}: ClientGridProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    if (onEdit) {
      onEdit(client);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // Custom renderer for actions column
  const customRenderers = {
    actions: (row: Client) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleView(row);
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
          title="View Details"
        >
          <Eye size={18} />
        </button>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition"
            title="Edit Client"
          >
            <Edit size={18} />
          </button>
        )}
      </div>
    ),
  };

  return (
    <>
      <DataGrid
        data={clients}
        columns={clientGridConfig}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        emptyMessage="No clients found. Create your first client to get started."
        customRenderers={customRenderers}
      />

      {selectedClient && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          data={selectedClient}
          columns={clientGridConfig}
          title="Client Details"
        />
      )}
    </>
  );
}