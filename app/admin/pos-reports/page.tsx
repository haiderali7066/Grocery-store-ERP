"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Download } from "lucide-react";

interface POSSale {
  _id: string;
  saleNumber: string;
  totalAmount: number;
  gstAmount: number;
  profit: number;
  costOfGoods: number;
  paymentMethod: string;
  fbrInvoiceNumber: string;
  fbrStatus: string;
  createdAt: string;
  cashier?: { name: string };
}

interface SaleSummary {
  totalSales: number;
  totalAmount: number;
  totalProfit: number;
  totalTax: number;
  avgSaleValue: number;
}

export default function POSReportsPage() {
  const [sales, setSales] = useState<POSSale[]>([]);
  const [summary, setSummary] = useState<SaleSummary>({
    totalSales: 0,
    totalAmount: 0,
    totalProfit: 0,
    totalTax: 0,
    avgSaleValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/admin/pos/sale");
        const data = await res.json();

        // Ensure sales is an array
        const salesData = Array.isArray(data?.sales) ? data.sales : [];
        setSales(salesData);

        // Ensure summary exists
        if (data?.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("[POS Reports] Error:", error);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const downloadReport = () => {
    if (!sales || sales.length === 0) return;

    const headers = [
      "Sale #",
      "Amount",
      "GST",
      "Profit",
      "Payment",
      "FBR Invoice",
      "Date",
    ];
    const rows = sales.map((sale) => [
      sale.saleNumber,
      `Rs ${sale.totalAmount}`,
      `Rs ${sale.gstAmount}`,
      `Rs ${sale.profit}`,
      sale.paymentMethod,
      sale.fbrInvoiceNumber || "Pending",
      new Date(sale.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pos-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading POS sales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              POS Sales Report
            </h1>
            <p className="text-gray-600">Walk-in customer transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline">
              <Printer size={18} className="mr-2" />
              Print
            </Button>
            <Button
              onClick={downloadReport}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalSales}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              Rs {summary.totalAmount.toFixed(2)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-blue-600">
              Rs {summary.totalProfit.toFixed(2)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Tax</p>
            <p className="text-2xl font-bold text-purple-600">
              Rs {summary.totalTax.toFixed(2)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Avg Sale</p>
            <p className="text-2xl font-bold">
              Rs {summary.avgSaleValue.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </>
          )}
        </div>

        {/* Sales Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Sale #
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    GST
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Cost
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Profit
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Payment
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    FBR Invoice
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    FBR Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">
                        {sale.saleNumber}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        Rs {sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-purple-600">
                        Rs {sale.gstAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-orange-600">
                        Rs {sale.costOfGoods.toFixed(2)}
                      </td>
                      <td className="p-4 text-blue-600 font-semibold">
                        Rs {sale.profit.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {sale.fbrInvoiceNumber || "Pending"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sale.fbrStatus === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {sale.fbrStatus || "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center p-4 text-gray-500">
                      No POS sales found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
