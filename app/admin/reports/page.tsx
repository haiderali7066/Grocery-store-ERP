'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, FileText } from 'lucide-react';

interface ReportData {
  totalProfit: number;
  totalSales: number;
  totalCost: number;
  productSales: Array<{ name: string; profit: number; sales: number }>;
  taxData: { taxableAmount: number; taxAmount: number; exemptAmount: number };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReportData(data.report);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading reports...</p>;
  }

  if (!reportData) {
    return <p>No report data available</p>;
  }

  const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and financial reports</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-md">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">
            Rs. {reportData.totalSales.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Cost</p>
          <p className="text-3xl font-bold text-gray-900">
            Rs. {reportData.totalCost.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <p className="text-gray-600 text-sm font-medium mb-2">Net Profit</p>
          <p className="text-3xl font-bold text-green-700">
            Rs. {reportData.totalProfit.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Profit Chart */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Product-wise Profit
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.productSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#16a34a" />
              <Bar dataKey="sales" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tax Distribution */}
        <Card className="p-6 border-0 shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tax Report</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: 'Taxable',
                    value: reportData.taxData.taxableAmount,
                  },
                  {
                    name: 'Tax Amount',
                    value: reportData.taxData.taxAmount,
                  },
                  {
                    name: 'Exempt',
                    value: reportData.taxData.exemptAmount,
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${value.toLocaleString()}`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-green-700" />
          <h2 className="text-lg font-bold text-gray-900">
            Financial Summary
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span>Total Sales Revenue</span>
            <span className="font-semibold">
              Rs. {reportData.totalSales.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span>Total Cost of Goods Sold (COGS)</span>
            <span className="font-semibold">
              Rs. {reportData.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span>Gross Profit</span>
            <span className="font-semibold text-green-700">
              Rs.{' '}
              {(reportData.totalSales - reportData.totalCost).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span>Total Tax Collected</span>
            <span className="font-semibold">
              Rs. {reportData.taxData.taxAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="font-bold">Net Profit (After Tax)</span>
            <span className="font-bold text-green-700 text-lg">
              Rs. {reportData.totalProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
