"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">CO</span>
              </div>
              <span className="text-xl font-bold text-slate-900">CodeOrigin.AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#management" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Management</a>
              <a href="#leave" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Leave Tracking</a>
            </div>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all hover:shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              CodeOrigin.AI - Enterprise HR Management
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
              Manage Your Team
              <span className="block text-gradient">With Confidence</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A modern HR management platform that simplifies employee onboarding,
              leave tracking, and workforce analytics in one beautiful interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 p-8 max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Employees", value: "248", icon: Users, iconClass: "text-blue-500" },
                  { label: "On Leave Today", value: "12", icon: CalendarCheck, iconClass: "text-amber-500" },
                  { label: "Pending Requests", value: "8", icon: Clock, iconClass: "text-purple-500" },
                  { label: "Departments", value: "6", icon: Building2, iconClass: "text-emerald-500" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.iconClass} mb-2`} />
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Decorative gradient */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed for modern HR teams to manage their workforce efficiently.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Employee Management",
                description: "Complete employee lifecycle management from onboarding to offboarding with detailed profiles.",
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                icon: CalendarCheck,
                title: "Leave Tracking",
                description: "Automated leave management with balance tracking, approval workflows, and monthly reset.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Shield,
                title: "Secure Access",
                description: "Enterprise-grade security with JWT authentication, role-based access, and encrypted data.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Real-time insights with interactive charts, department analytics, and workforce metrics.",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Building2,
                title: "Department Management",
                description: "Organize employees by departments, track team sizes, and manage hierarchies.",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: Clock,
                title: "Attendance & Shifts",
                description: "Track work locations, shift timings, and employee availability in real-time.",
                gradient: "from-rose-500 to-red-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white border border-slate-200/50 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Employee Management Section */}
      <section id="management" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Complete Employee
                <span className="text-gradient"> Lifecycle Management</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                From onboarding to performance tracking, manage every aspect of your
                employee journey with our comprehensive management tools.
              </p>
              <ul className="space-y-4">
                {[
                  "Digital onboarding with all employee details",
                  "Department and designation management",
                  "Salary and banking information",
                  "Real-time status tracking",
                  "Search and filter capabilities",
                  "Export reports to PDF/Excel",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="space-y-4">
                  {[
                    { name: "John Doe", dept: "Engineering", status: "Active" },
                    { name: "Jane Smith", dept: "Design", status: "Active" },
                    { name: "Mike Johnson", dept: "Marketing", status: "On Leave" },
                  ].map((emp, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-semibold text-sm">
                          {emp.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.dept}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === "Active" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leave Tracking Section */}
      <section id="leave" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-4">Leave Balance</h4>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">2</p>
                    <p className="text-xs text-slate-600 mt-1">Total CL</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">1</p>
                    <p className="text-xs text-slate-600 mt-1">Remaining</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">1</p>
                    <p className="text-xs text-slate-600 mt-1">Used</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">May 2024 - CL</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium">Approved</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Apr 2024 - CL</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">Pending</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Smart Leave
                <span className="text-gradient"> Tracking System</span>
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Automated monthly CL allocation with no carry-forward policy. 
                Employees get 2 CL per month with automatic reset.
              </p>
              <ul className="space-y-4">
                {[
                  "2 Casual Leaves per month allocation",
                  "No carry-forward policy - use it or lose it",
                  "Automatic monthly balance reset",
                  "One-click leave application",
                  "HR approval workflow",
                  "Complete leave history tracking",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">
            Ready to Streamline Your HR?
          </h2>
          <p className="text-slate-300 text-lg mb-8 relative">
            Start managing your workforce with our enterprise-grade platform today.
          </p>
          <Link
            href="/login"
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg"
          >
            Access Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">CO</span>
              </div>
              <span className="font-bold text-slate-900">CodeOrigin.AI</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} CodeOrigin.AI - HR Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
