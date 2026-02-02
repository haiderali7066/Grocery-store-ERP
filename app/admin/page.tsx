"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Link as LinkIcon,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalSales: number | null;
  totalOrders: number | null;
  totalProfit: number | null;
  pendingOrders: number | null;
  lowStockProducts: Array<{ name: string; stock: number; threshold: number }>;
  monthlyData: Array<{ month: string; sales: number; profit: number }>;
  dailyData: Array<{ date: string; sales: number; profit: number }>;
  gstCollected: number | null;
  gstLiability: number | null;
  posRevenue: number | null;
  onlineRevenue: number | null;
  pendingPayments: number | null;
  fbrStatus: string;
}

// Helper to safely format numbers
const formatCurrency = (value: number | null | undefined) =>
  typeof value === "number" ? value.toLocaleString() : "0";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "custom"
  >("month");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const stats_data = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalProfit: 0,
    pendingOrders: 0,
    lowStockProducts: [],
    monthlyData: [],
    dailyData: [],
    gstCollected: 0,
    gstLiability: 0,
    posRevenue: 0,
    onlineRevenue: 0,
    pendingPayments: 0,
    fbrStatus: "unknown",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your store overview.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {formatCurrency(stats_data.totalSales)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats_data.totalOrders)}
              </p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Profit</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {formatCurrency(stats_data.totalProfit)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats_data.pendingOrders)}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">GST Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {formatCurrency(stats_data.gstCollected)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Low Stock Items
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats_data.lowStockProducts.length}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Pending Payments
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats_data.pendingPayments)}
              </p>
            </div>
            <ShoppingCart className="h-12 w-12 text-amber-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">POS Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {formatCurrency(stats_data.posRevenue)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Online Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {formatCurrency(stats_data.onlineRevenue)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Monthly Sales
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats_data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `Rs. ${formatCurrency(Number(value))}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#16a34a"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Profit Breakdown */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Revenue Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "POS Revenue", value: stats_data.posRevenue ?? 0 },
                  {
                    name: "Online Revenue",
                    value: stats_data.onlineRevenue ?? 0,
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${formatCurrency(Number(value))}`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#16a34a" />
                <Cell fill="#0ea5e9" />
              </Pie>
              <Tooltip
                formatter={(value) => `Rs. ${formatCurrency(Number(value))}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Low Stock & Tax Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Low Stock Alerts
          </h2>
          {stats_data.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats_data.lowStockProducts.slice(0, 5).map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-red-50 p-3 rounded border-l-4 border-red-600"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {product.stock} / Threshold: {product.threshold}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              ))}
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                View All Low Stock Items
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              All stock levels are healthy
            </p>
          )}
        </Card>

        {/* Tax Overview */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tax Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
              <div>
                <p className="text-sm text-gray-600">GST Collected</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rs. {formatCurrency(stats_data.gstCollected)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded">
              <div>
                <p className="text-sm text-gray-600">Tax Liability</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rs. {formatCurrency(stats_data.gstLiability)}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-600">FBR Status</p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {stats_data.fbrStatus === "active"
                  ? "Active & Compliant"
                  : "Pending Setup"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-md lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pending Orders
          </h2>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Order #{1001 + idx}
                  </p>
                  <p className="text-sm text-gray-600">
                    Awaiting payment verification
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Zap className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              POS Billing
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
