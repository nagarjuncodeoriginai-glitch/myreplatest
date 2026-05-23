"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit2,
  Trash2,
  X,
  UserPlus,
  AlertCircle,
  Users,
  Download,
} from "lucide-react";
import { Employee, EmployeeFormData } from "@/types";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { exportToCSV } from "@/utils/export-csv";

const defaultForm: EmployeeFormData = {
  emp_id: "",
  full_name: "",
  email: "",
  phone: "",
  gender: "Male",
  date_of_birth: "",
  address: "",
  department: "",
  designation: "",
  manager_name: "",
  doj: "",
  employment_type: "Full-Time",
  probation_period: "",
  confirmation_date: "",
  work_location: "",
  shift_timing: "",
  salary_package: "",
  bank_account_number: "",
  ifsc_code: "",
  pan_number: "",
  aadhaar_number: "",
  username: "",
  password: "",
  profile_photo: "",
  status: "active",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const toast = useToast();
  const { confirm } = useConfirm();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
        ...(departmentFilter && { department: departmentFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/employees?${params}`);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
        setTotal(json.total);
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const url = editId ? `/api/employees/${editId}` : "/api/employees";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (json.success) {
        setShowModal(false);
        setForm(defaultForm);
        setEditId(null);
        fetchEmployees();
        toast.success(editId ? "Employee Updated" : "Employee Created", json.message);
      } else {
        setFormError(json.message || "Operation failed");
      }
    } catch {
      setFormError("Network error. Please try again.");
      toast.error("Network Error", "Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      ...emp,
      password: "",
      profile_photo: emp.profile_photo || "",
      date_of_birth: emp.date_of_birth?.split("T")[0] || "",
      doj: emp.doj?.split("T")[0] || "",
      confirmation_date: emp.confirmation_date?.split("T")[0] || "",
    });
    setEditId(emp.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete Employee",
      message: "Are you sure you want to delete this employee? This will also remove all their leave records. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Keep",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchEmployees();
        toast.success("Employee Deleted", "Employee and related data removed successfully.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete Failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total} total employee{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (employees.length === 0) { toast.warning("No Data", "No employees to export."); return; }
              exportToCSV(employees.map(({ profile_photo, ...rest }) => rest), "employees");
              toast.success("Export Complete", "Employee data exported as CSV.");
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              setForm(defaultForm);
              setEditId(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white font-medium rounded-lg text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email, or department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_probation">On Probation</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-12 h-12 mb-3" />
            <p className="font-medium">No employees found</p>
            <p className="text-sm">Add your first employee to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Designation</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">DOJ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                          {emp.profile_photo ? (
                            <img src={emp.profile_photo} alt={emp.full_name} className="w-full h-full object-cover" />
                          ) : (
                            emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{emp.full_name}</p>
                          <p className="text-xs text-slate-500">{emp.emp_id} &middot; {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{emp.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === "active" ? "bg-emerald-50 text-emerald-700" :
                        emp.status === "inactive" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {emp.status === "on_probation" ? "Probation" : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {emp.doj ? new Date(emp.doj).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= total}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editId ? "Edit Employee" : "Add New Employee"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                {formError && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{formError}</span>
                  </div>
                )}

                {/* Profile Photo */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Profile Photo</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {form.profile_photo ? (
                      <img src={form.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 500 * 1024) {
                              setFormError("Photo must be less than 500KB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm({ ...form, profile_photo: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      Upload Photo
                    </label>
                    {form.profile_photo && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, profile_photo: "" })}
                        className="ml-2 text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG. Max 500KB.</p>
                  </div>
                </div>

                {/* Basic Information */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Employee ID *</label>
                    <input type="text" value={form.emp_id} onChange={(e) => setForm({ ...form, emp_id: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="EMP001" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Full Name *</label>
                    <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="john@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Phone *</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Gender *</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Date of Birth</label>
                    <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-600 mb-1">Address</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Full address" />
                  </div>
                </div>

                {/* Job Information */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Job Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Department *</label>
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Designation *</label>
                    <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Manager Name</label>
                    <input type="text" value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Manager Name" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Date of Joining *</label>
                    <input type="date" value={form.doj} onChange={(e) => setForm({ ...form, doj: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Employment Type</label>
                    <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value as EmployeeFormData["employment_type"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Work Location</label>
                    <input type="text" value={form.work_location} onChange={(e) => setForm({ ...form, work_location: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Office / Remote" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Shift Timing</label>
                    <input type="text" value={form.shift_timing} onChange={(e) => setForm({ ...form, shift_timing: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="9 AM - 6 PM" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeFormData["status"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_probation">On Probation</option>
                    </select>
                  </div>
                </div>

                {/* Salary & Banking */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Salary & Banking</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Salary Package</label>
                    <input type="text" value={form.salary_package} onChange={(e) => setForm({ ...form, salary_package: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="8,00,000 PA" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Bank Account Number</label>
                    <input type="text" value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">IFSC Code</label>
                    <input type="text" value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">PAN Number</label>
                    <input type="text" value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Aadhaar Number</label>
                    <input type="text" value={form.aadhaar_number} onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                {/* Account Credentials */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Account Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Username *</label>
                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="john.doe" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Password {editId ? "(leave blank to keep current)" : "*"}
                    </label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm font-medium text-white gradient-primary rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editId ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
