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
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface RefundRequest {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
  };
  requestedAmount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  approvedBy?: { name: string };
  approvedAt?: string;
  refundedAmount?: number;
  notes?: string;
  createdAt: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalAmount, setApprovalAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch refund requests
  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const res = await fetch("/api/admin/refunds");
        const data = await res.json();
        const refundsArray = Array.isArray(data) ? data : [];
        setRefunds(refundsArray);
        setFilteredRefunds(refundsArray);
      } catch (error) {
        console.error("[Refunds] Error fetching:", error);
        setRefunds([]);
        setFilteredRefunds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  // Filter refunds
  useEffect(() => {
    let filtered = refunds;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.order.orderNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          r.reason.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredRefunds(filtered);
  }, [refunds, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      approved: { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      refunded: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
    };
    const badge = badges[status];
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
      >
        <badge.icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleApprove = async () => {
    if (!selectedRefund || !approvalAmount) {
      alert("Please enter refund amount");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/refunds/${selectedRefund._id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalAmount: parseFloat(approvalAmount),
            notes: approvalNotes,
          }),
        },
      );

      if (!res.ok) throw new Error("Approval failed");

      // Update local state
      setRefunds(
        refunds.map((r) =>
          r._id === selectedRefund._id
            ? {
                ...r,
                status: "approved",
                refundedAmount: parseFloat(approvalAmount),
                notes: approvalNotes,
              }
            : r,
        ),
      );

      setShowDetail(false);
      setSelectedRefund(null);
      setApprovalAmount("");
      setApprovalNotes("");
    } catch (error) {
      console.error("[Refunds] Error approving:", error);
      alert("Failed to approve refund");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRefund) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/refunds/${selectedRefund._id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: approvalNotes }),
        },
      );

      if (!res.ok) throw new Error("Rejection failed");

      setRefunds(
        refunds.map((r) =>
          r._id === selectedRefund._id
            ? { ...r, status: "rejected", notes: approvalNotes }
            : r,
        ),
      );

      setShowDetail(false);
      setSelectedRefund(null);
      setApprovalNotes("");
    } catch (error) {
      console.error("[Refunds] Error rejecting:", error);
      alert("Failed to reject refund");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading refund requests...</p>
      </div>
    );
  }

  if (showDetail && selectedRefund) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* ... your detailed view stays the same ... */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Refund Requests</h1>
          <p className="text-gray-600">Manage customer refund requests</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-right flex items-center justify-end text-sm">
            <span className="text-gray-600">
              {filteredRefunds.length} requests
            </span>
          </div>
        </div>

        {/* Refund Requests List */}
        {Array.isArray(filteredRefunds) && filteredRefunds.length > 0 ? (
          <div className="space-y-4">
            {filteredRefunds.map((refund) => (
              <Card key={refund._id} className="p-4 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {refund.order.orderNumber}
                      </h3>
                      {getStatusBadge(refund.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Requested</p>
                        <p className="font-semibold text-red-600">
                          Rs {refund.requestedAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reason</p>
                        <p className="font-semibold">{refund.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold">
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {refund.refundedAmount && (
                        <div>
                          <p className="text-gray-600">Refunded</p>
                          <p className="font-semibold text-green-600">
                            Rs {refund.refundedAmount}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRefund(refund);
                      setShowDetail(true);
                      setApprovalAmount(refund.requestedAmount.toString());
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Eye size={16} className="mr-2" />
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No refund requests found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
