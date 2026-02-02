"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Printer, Save, X } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  gst: number;
  subtotal: number;
  taxExempt: boolean;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  gst: number;
  taxExempt: boolean;
  stock: number;
  weight: { value: number; unit: string };
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "manual"
  >("cash");
  const [loading, setLoading] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [lastSaleNumber, setLastSaleNumber] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        // Ensure data is always an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data?.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.warn("[POS] Products API returned invalid data:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("[POS] Error fetching products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.id === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.price,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product._id,
          name: product.name,
          quantity,
          price: product.basePrice,
          gst: product.gst,
          subtotal: product.basePrice * quantity,
          taxExempt: product.taxExempt,
        },
      ];
    });
    setSearchTerm("");
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price,
            }
          : item,
      ),
    );
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const gstAmount = cart.reduce(
    (sum, item) =>
      item.taxExempt ? sum : sum + (item.subtotal * item.gst) / 100,
    0,
  );
  const total = subtotal + gstAmount;

  // Complete sale
  const completeSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          subtotal,
          gstAmount,
          totalAmount: total,
        }),
      });

      if (!response.ok) throw new Error("Sale failed");

      const result = await response.json();
      setLastSaleNumber(result.saleNumber);
      setSaleCompleted(true);
      setShowReceipt(true);
      setCart([]);
      setPaymentMethod("cash");

      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("[POS] Error completing sale:", error);
      alert("Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const resetSale = () => {
    setSaleCompleted(false);
    setLastSaleNumber("");
    setShowReceipt(false);
  };

  if (showReceipt && lastSaleNumber) {
    return <POSReceipt saleNumber={lastSaleNumber} onClose={resetSale} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            POS Billing System
          </h1>
          <p className="text-gray-600">
            Complete walk-in customer transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <Input
                  placeholder="Search by product name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => addToCart(product)}
                  >
                    <h3 className="font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">
                      {product.weight.value} {product.weight.unit}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-green-600">
                        Rs {product.basePrice}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </Card>
          </div>

          {/* Cart & Payment */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Cart Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Rs {item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        Rs {item.subtotal}
                      </span>
                    </div>
                    {!item.taxExempt && (
                      <p className="text-xs text-gray-600 mt-1">
                        GST: Rs {(item.subtotal * item.gst) / 100}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {cart.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Cart is empty
                </div>
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <div className="space-y-2 mb-6 pt-4 border-t">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (17%):</span>
                    <span>Rs {gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">
                      Rs {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Payment Method
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {cart.length > 0 && (
                  <Button
                    onClick={completeSale}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save size={18} className="mr-2" />
                    Complete Sale (Rs {total.toFixed(2)})
                  </Button>
                )}
                {cart.length > 0 && (
                  <Button
                    onClick={() => setCart([])}
                    variant="outline"
                    className="w-full"
                  >
                    <X size={18} className="mr-2" />
                    Clear Cart
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Receipt Component
function POSReceipt({
  saleNumber,
  onClose,
}: {
  saleNumber: string;
  onClose: () => void;
}) {
  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-2xl font-bold">KHAS PURE FOOD</h1>
          <p className="text-sm text-gray-600">Official POS Receipt</p>
          <p className="text-xs text-gray-500 mt-2">Sale: {saleNumber}</p>
        </div>

        <div className="border-t-2 border-b-2 py-4 my-4 text-xs">
          <p className="text-center">{new Date().toLocaleString()}</p>
        </div>

        <div className="text-center py-8">
          <p className="text-lg font-bold text-green-600 mb-2">
            Sale Completed
          </p>
          <p className="text-sm text-gray-600">
            Your transaction has been processed successfully
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="text-sm text-center">
            Receipt #{saleNumber} has been sent to FBR
          </p>
        </div>

        <div className="flex gap-3 no-print">
          <Button
            onClick={() => window.print()}
            className="flex-1"
            variant="outline"
          >
            <Printer size={18} className="mr-2" />
            Print Receipt
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
