"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Leave } from "@/types";

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/leaves?${params}`);
      const json = await res.json();
      if (json.success) {
        setLeaves(json.data);
        setTotal(json.total);
      }
    } catch (error) {
      console.error("Fetch leaves error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleAction = async (leaveId: number, action: "approved" | "rejected") => {
    setActionLoading(leaveId);
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        fetchLeaves();
      }
    } catch (error) {
      console.error("Leave action error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage employee leave requests
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { value: "", label: "All", icon: CalendarDays },
          { value: "pending", label: "Pending", icon: Clock },
          { value: "approved", label: "Approved", icon: CheckCircle },
          { value: "rejected", label: "Rejected", icon: XCircle },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-600 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CalendarDays className="w-12 h-12 mb-3" />
            <p className="font-medium">No leave applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Leave Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Applied</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <motion.tr
                    key={leave.id}
                    className="hover:bg-slate-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{leave.employee_name}</p>
                        <p className="text-xs text-slate-500">{leave.emp_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                        CL
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" - "}
                      {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        leave.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                        leave.status === "rejected" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(leave.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(leave.id, "approved")}
                            disabled={actionLoading === leave.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(leave.id, "rejected")}
                            disabled={actionLoading === leave.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 text-right block">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
