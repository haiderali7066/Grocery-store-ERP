'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  _id: string;
  name: string;
  stock: number;
  buyingRate: number;
  quantity: number;
  lowStockThreshold: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    buyingRate: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: [
            {
              product: formData.productId,
              quantity: parseInt(formData.quantity),
              buyingRate: parseFloat(formData.buyingRate),
            },
          ],
          supplier: '', // Will need supplier selection
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ productId: '', quantity: '', buyingRate: '' });
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const lowStockItems = inventory.filter(
    (item) => item.stock <= item.lowStockThreshold
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage stock & FIFO tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock (Purchase)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <Input
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buying Rate (Rs.)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.buyingRate}
                  onChange={(e) =>
                    setFormData({ ...formData, buyingRate: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-green-700">
                Add Stock
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="p-4 bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Low Stock Alert</p>
              <p className="text-sm text-orange-700">
                {lowStockItems.length} products need restocking
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="p-6 border-0 shadow-md overflow-x-auto">
        {isLoading ? (
          <p>Loading inventory...</p>
        ) : inventory.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Product
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Stock
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Buying Rate
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item._id}
                  className={`border-b border-gray-100 ${
                    item.stock <= item.lowStockThreshold ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-sm">{item.stock}</td>
                  <td className="py-3 px-4 text-sm">
                    Rs. {item.buyingRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {item.stock <= item.lowStockThreshold ? (
                      <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Adequate
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">No inventory items</p>
        )}
      </Card>
    </div>
  );
}
