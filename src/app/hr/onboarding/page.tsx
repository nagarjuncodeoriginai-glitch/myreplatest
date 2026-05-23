"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  UserPlus, CheckCircle2, Circle, Clock, ArrowRight,
  FileText, Shield, Laptop, BookOpen, Users, Briefcase,
  Mail, Phone, MapPin, Calendar, ChevronDown, ChevronUp,
  Plus, X, Edit2, Trash2, Eye, Sparkles, Rocket,
  GraduationCap, Heart, Coffee, Star, Target,
} from "lucide-react";


interface OnboardingEmployee {
  id: number;
  name: string;
  emp_id: string;
  department: string;
  designation: string;
  doj: string;
  status: "not_started" | "in_progress" | "completed";
  currentStep: number;
  completedSteps: number[];
}

const onboardingSteps = [
  { id: 1, title: "Document Verification", description: "ID proof, address proof, education certificates", icon: FileText, duration: "Day 1" },
  { id: 2, title: "IT Setup & Access", description: "Laptop, email, software access, VPN credentials", icon: Laptop, duration: "Day 1-2" },
  { id: 3, title: "Policy Orientation", description: "Company policies, code of conduct, leave policy", icon: Shield, duration: "Day 2" },
  { id: 4, title: "Team Introduction", description: "Meet the team, manager 1:1, buddy assignment", icon: Users, duration: "Day 2-3" },
  { id: 5, title: "Role Training", description: "Job-specific training, tools walkthrough, KPIs", icon: GraduationCap, duration: "Week 1" },
  { id: 6, title: "HR Orientation", description: "Benefits enrollment, emergency contacts, feedback", icon: Heart, duration: "Week 1" },
  { id: 7, title: "30-Day Check-in", description: "Progress review, feedback session, goal setting", icon: Target, duration: "Day 30" },
];

const orientationModules = [
  { title: "Company Culture & Values", duration: "45 min", status: "required", icon: Star },
  { title: "Workplace Safety & Compliance", duration: "30 min", status: "required", icon: Shield },
  { title: "IT Security & Data Privacy", duration: "20 min", status: "required", icon: Laptop },
  { title: "Benefits & Compensation Guide", duration: "25 min", status: "optional", icon: Briefcase },
  { title: "Communication Tools Training", duration: "15 min", status: "optional", icon: Mail },
  { title: "Employee Wellness Program", duration: "20 min", status: "optional", icon: Coffee },
];


export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "orientation" | "checklist">("tracker");
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample onboarding data
  const [employees] = useState<OnboardingEmployee[]>([
    { id: 1, name: "Rahul Sharma", emp_id: "EMP001", department: "Engineering", designation: "Software Engineer", doj: "2025-06-01", status: "in_progress", currentStep: 3, completedSteps: [1, 2] },
    { id: 4, name: "Sneha Patel", emp_id: "EMP004", department: "Marketing", designation: "Marketing Executive", doj: "2025-05-20", status: "in_progress", currentStep: 5, completedSteps: [1, 2, 3, 4] },
    { id: 6, name: "New Hire - Pending", emp_id: "EMP006", department: "Design", designation: "UI Designer", doj: "2025-06-15", status: "not_started", currentStep: 0, completedSteps: [] },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "in_progress": return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  const getProgressPercentage = (emp: OnboardingEmployee) => {
    return Math.round((emp.completedSteps.length / onboardingSteps.length) * 100);
  };

  const tabs = [
    { id: "tracker" as const, label: "Onboarding Tracker", icon: Rocket },
    { id: "orientation" as const, label: "Orientation Program", icon: GraduationCap },
    { id: "checklist" as const, label: "Checklist Template", icon: CheckCircle2 },
  ];


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Onboarding</h2>
          <p className="text-sm text-slate-500 mt-1">Track new hire onboarding progress and orientation workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Start New Onboarding
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{employees.filter(e => e.status === "in_progress").length}</p>
            <p className="text-sm text-slate-500">In Progress</p>
          </div>
        </motion.div>
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{employees.filter(e => e.status === "not_started").length}</p>
            <p className="text-sm text-slate-500">Not Started</p>
          </div>
        </motion.div>
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{employees.filter(e => e.status === "completed").length}</p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="card-enterprise p-1.5">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Onboarding Tracker */}
        {activeTab === "tracker" && (
          <motion.div key="tracker" className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {employees.map((emp, i) => (
              <motion.div key={emp.id} className="card-enterprise overflow-hidden"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{emp.name}</h4>
                        <p className="text-sm text-slate-500">{emp.designation} &middot; {emp.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">Joining: {new Date(emp.doj).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-4">
                      <div className="w-48">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-600">{getProgressPercentage(emp)}% Complete</span>
                          <span className="text-xs text-slate-400">{emp.completedSteps.length}/{onboardingSteps.length}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage(emp)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                      <span className={`badge px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(emp.status)}`}>
                        {emp.status === "in_progress" ? "In Progress" : emp.status === "completed" ? "Completed" : "Not Started"}
                      </span>
                      <button onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                        className="btn-icon w-9 h-9">
                        {selectedEmployee?.id === emp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Steps */}
                <AnimatePresence>
                  {selectedEmployee?.id === emp.id && (
                    <motion.div className="px-6 pb-6 border-t border-slate-100 pt-4"
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {onboardingSteps.map((step) => {
                          const isCompleted = emp.completedSteps.includes(step.id);
                          const isCurrent = emp.currentStep === step.id;
                          return (
                            <div key={step.id} className={`p-3.5 rounded-xl border transition-all ${
                              isCompleted ? "bg-emerald-50/50 border-emerald-200" :
                              isCurrent ? "bg-blue-50/50 border-blue-200 shadow-sm" :
                              "bg-slate-50/50 border-slate-200"
                            }`}>
                              <div className="flex items-start gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isCompleted ? "bg-emerald-100" : isCurrent ? "bg-blue-100" : "bg-slate-200"
                                }`}>
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                                   isCurrent ? <Clock className="w-4 h-4 text-blue-600" /> :
                                   <Circle className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-semibold ${isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-700" : "text-slate-600"}`}>
                                    {step.title}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{step.description}</p>
                                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">{step.duration}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}


        {/* Orientation Program */}
        {activeTab === "orientation" && (
          <motion.div key="orientation" className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="card-enterprise overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Orientation Program Modules</h3>
                    <p className="text-xs text-slate-500">Structured learning path for new employees</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orientationModules.map((module, i) => (
                  <motion.div key={module.title} className="p-5 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer bg-white"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <module.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        module.status === "required" ? "text-red-600 bg-red-50 border border-red-100" : "text-slate-500 bg-slate-100 border border-slate-200"
                      }`}>{module.status}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{module.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{module.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Checklist Template */}
        {activeTab === "checklist" && (
          <motion.div key="checklist" className="card-enterprise overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Standard Onboarding Checklist</h3>
                  <p className="text-xs text-slate-500 mt-0.5">7-step process for every new hire</p>
                </div>
                <span className="badge-info text-xs">Template</span>
              </div>
            </div>
            <div className="p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-8 bottom-8 w-0.5 bg-slate-200" />
                <div className="space-y-6">
                  {onboardingSteps.map((step, i) => (
                    <motion.div key={step.id} className="flex items-start gap-4 relative"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
                        {step.id}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{step.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100">{step.duration}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                      </div>
                      <step.icon className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
