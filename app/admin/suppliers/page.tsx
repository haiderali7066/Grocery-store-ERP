'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';

interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (confirm('Are you sure?')) {
      try {
        await fetch(`/api/admin/suppliers/${supplierId}`, {
          method: 'DELETE',
        });
        fetchSuppliers();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage supplier information and ledgers</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier._id} className="p-6 border-0 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {supplier.name}
            </h3>

            <div className="space-y-2 mb-4">
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {supplier.email}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-600">Current Balance</p>
              <p className="text-lg font-bold text-gray-900">
                Rs. {supplier.balance.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(supplier._id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading suppliers...</p>}
      {!isLoading && suppliers.length === 0 && (
        <p className="text-center text-gray-500 py-12">No suppliers found</p>
      )}
    </div>
  );
}
