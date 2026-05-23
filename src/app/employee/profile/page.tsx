"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { Employee } from "@/types";

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      const res = await fetch(`/api/employees/${user.id}`);
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Profile not found</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Personal Information",
      icon: User,
      fields: [
        { label: "Full Name", value: profile.full_name },
        { label: "Employee ID", value: profile.emp_id },
        { label: "Email", value: profile.email },
        { label: "Phone", value: profile.phone },
        { label: "Gender", value: profile.gender },
        { label: "Date of Birth", value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-IN") : "—" },
        { label: "Address", value: profile.address || "—" },
      ],
    },
    {
      title: "Employment Details",
      icon: Briefcase,
      fields: [
        { label: "Department", value: profile.department },
        { label: "Designation", value: profile.designation },
        { label: "Manager", value: profile.manager_name || "—" },
        { label: "Date of Joining", value: profile.doj ? new Date(profile.doj).toLocaleDateString("en-IN") : "—" },
        { label: "Employment Type", value: profile.employment_type },
        { label: "Work Location", value: profile.work_location || "—" },
        { label: "Shift Timing", value: profile.shift_timing || "—" },
        { label: "Status", value: profile.status === "active" ? "Active" : profile.status === "on_probation" ? "On Probation" : "Inactive" },
      ],
    },
    {
      title: "Financial Information",
      icon: CreditCard,
      fields: [
        { label: "Salary Package", value: profile.salary_package || "—" },
        { label: "Bank Account", value: profile.bank_account_number ? `****${profile.bank_account_number.slice(-4)}` : "—" },
        { label: "IFSC Code", value: profile.ifsc_code || "—" },
        { label: "PAN Number", value: profile.pan_number ? `${profile.pan_number.slice(0, 2)}****${profile.pan_number.slice(-2)}` : "—" },
        { label: "Aadhaar Number", value: profile.aadhaar_number ? `****${profile.aadhaar_number.slice(-4)}` : "—" },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <motion.div
        className="bg-white rounded-xl border border-slate-200/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
            {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.full_name}</h2>
            <p className="text-slate-500">{profile.designation} &middot; {profile.department}</p>
            <p className="text-sm text-slate-400 mt-0.5">{profile.emp_id}</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${
              profile.status === "active" ? "bg-emerald-50 text-emerald-700" :
              profile.status === "on_probation" ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-700"
            }`}>
              {profile.status === "active" ? "Active" : profile.status === "on_probation" ? "On Probation" : "Inactive"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Profile Sections */}
      {sections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          className="bg-white rounded-xl border border-slate-200/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sIdx + 1) * 0.1 }}
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <section.icon className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{field.label}</p>
                  <p className="text-sm text-slate-900 mt-1">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
