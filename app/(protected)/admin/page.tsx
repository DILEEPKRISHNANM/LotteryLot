"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { ClientGrid } from "@/components/admin/ClientGrid";
import { Client } from "@/components/admin/clientGridUtils";
import { LogOut, Plus, Users } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { API_ADMIN_USERS_ENDPOINT } from "@/lib/utils/constants";
import { AddClientModal } from "@/components/admin/AddClientModal";

interface ApiResponse {
  success: boolean;
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Fetch clients
  const fetchClients = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await apiClient.get<ApiResponse>(
          API_ADMIN_USERS_ENDPOINT + `?page=${page}&limit=10`
        );

        if (response.success && response.data) {
          if (append) {
            setClients((prev) => [
              ...prev,
              ...response.data.map((client, index) => ({
                ...client,
                slNo: (page - 1) * 10 + index + 1,
              })),
            ]);
          } else {
            setClients(response.data.map((client, index) => ({ ...client, slNo: index + 1 })));
          }
          setHasMore(response.pagination.hasMore);
          setCurrentPage(page);
          setError(null);
        }
      } catch (error: any) {
        console.error("Failed to fetch clients:", error);
        setError(error.message || "Failed to load clients");
        toastError(error.message || "Failed to load clients");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchClients(1, false);
  }, [fetchClients]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchClients(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchClients]);

  // Logout handler
  const handleLogout = () => {
    apiClient.setToken(null);
    router.push("/login");
  };

  // Edit handler
  const handleEdit = (client: Client) => {
    // TODO: Open edit modal or navigate to edit page
    console.log("Edit client:", client);
    toastSuccess("Edit functionality coming soon!");
  };

  // Add new client handler
  const handleAddClient = () => {
    setIsAddClientModalOpen(true);
  };

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Users className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition cursor-pointer"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats or Info Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.length}
                </p>
              </div>
              <button
                onClick={handleAddClient}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition cursor-pointer"
              >
                <Plus size={20} />
                Add New Client
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Client Grid */}
        <ClientGrid
          clients={clients}
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={handleLoadMore}
          onEdit={handleEdit}
        />
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={handleAddClient}
        className="fixed bottom-6 right-6 sm:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition z-20"
        aria-label="Add new client"
      >
        <Plus size={24} />
      </button>

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={() => {
          fetchClients(1, false);
        }}
      />
    </div>
  );
}
