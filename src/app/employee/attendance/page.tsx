"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, LogIn, LogOut, Calendar, CheckCircle2, XCircle,
  Timer, TrendingUp, Coffee, Sun, Moon, MapPin,
  ChevronLeft, ChevronRight, Zap, BarChart3, AlertCircle,
} from "lucide-react";


interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "present" | "absent" | "late" | "half-day" | "holiday" | "weekend";
  hours: number;
}

// Generate sample attendance for current month
function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  for (let day = 1; day <= today; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split("T")[0];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      records.push({ date: dateStr, checkIn: null, checkOut: null, status: "weekend", hours: 0 });
    } else if (Math.random() > 0.9) {
      records.push({ date: dateStr, checkIn: null, checkOut: null, status: "absent", hours: 0 });
    } else if (Math.random() > 0.85) {
      records.push({ date: dateStr, checkIn: "09:45", checkOut: "18:15", status: "late", hours: 8.5 });
    } else {
      const checkInHr = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 30);
      const checkOutHr = 17 + Math.floor(Math.random() * 2);
      const checkOutMin = Math.floor(Math.random() * 45);
      records.push({
        date: dateStr,
        checkIn: `${String(checkInHr).padStart(2, "0")}:${String(checkInMin).padStart(2, "0")}`,
        checkOut: `${String(checkOutHr).padStart(2, "0")}:${String(checkOutMin).padStart(2, "0")}`,
        status: "present",
        hours: checkOutHr - checkInHr + (checkOutMin - checkInMin) / 60,
      });
    }
  }
  return records;
}

export default function AttendancePage() {
  const [attendance] = useState<AttendanceRecord[]>(generateAttendance());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setCheckedIn(true);
  };

  const handleCheckOut = () => { setCheckedIn(false); };

  // Stats
  const presentDays = attendance.filter(a => a.status === "present").length;
  const lateDays = attendance.filter(a => a.status === "late").length;
  const absentDays = attendance.filter(a => a.status === "absent").length;
  const totalWorkingDays = attendance.filter(a => a.status !== "weekend" && a.status !== "holiday").length;
  const avgHours = attendance.filter(a => a.hours > 0).reduce((sum, a) => sum + a.hours, 0) / Math.max(presentDays + lateDays, 1);


  // Calendar helpers
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDateStatus = (day: number): AttendanceRecord["status"] | null => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = attendance.find(a => a.date === dateStr);
    return record?.status || null;
  };

  const statusColors: Record<string, string> = {
    present: "bg-emerald-500",
    late: "bg-amber-500",
    absent: "bg-red-500",
    "half-day": "bg-orange-400",
    holiday: "bg-blue-400",
    weekend: "bg-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500 mt-1">Track your daily check-in, check-out, and attendance history</p>
        </div>
      </div>

      {/* Check-in/out Card + Live Clock */}
      <motion.div className="card-enterprise-elevated overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Clock */}
            <div className="text-center md:text-left">
              <p className="text-5xl font-bold text-white font-mono tracking-tight">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
              <p className="text-sm text-blue-200 mt-2">
                {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <MapPin className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs text-blue-300">Office - Main Building</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-white/20" />

            {/* Check-in/out Button */}
            <div className="flex flex-col items-center gap-3">
              {!checkedIn ? (
                <motion.button onClick={handleCheckIn}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center gap-3"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <LogIn className="w-6 h-6" /> Check In
                </motion.button>
              ) : (
                <motion.button onClick={handleCheckOut}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg shadow-2xl shadow-red-500/30 hover:from-red-400 hover:to-rose-500 transition-all flex items-center gap-3"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <LogOut className="w-6 h-6" /> Check Out
                </motion.button>
              )}
              {checkedIn && checkInTime && (
                <p className="text-xs text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked in at {checkInTime}
                </p>
              )}
              {!checkedIn && checkInTime && (
                <p className="text-xs text-blue-300">Last check-in: {checkInTime}</p>
              )}
            </div>

            {/* Today's Status */}
            <div className="hidden lg:flex flex-col items-center gap-1 ml-auto">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${checkedIn ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/10 border border-white/20"}`}>
                {checkedIn ? <Sun className="w-7 h-7 text-emerald-300" /> : <Moon className="w-7 h-7 text-slate-400" />}
              </div>
              <span className="text-[11px] text-blue-200 font-medium mt-1">{checkedIn ? "Working" : "Not Clocked"}</span>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present Days", value: presentDays, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Late Arrivals", value: lateDays, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Absent", value: absentDays, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Avg. Hours/Day", value: avgHours.toFixed(1), icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <motion.div key={stat.label} className="card-enterprise p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar + Recent Records */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Calendar View */}
        <motion.div className="lg:col-span-7 card-enterprise p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Attendance Calendar</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}
                className="btn-icon w-8 h-8"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">{monthNames[calendarMonth]} {calendarYear}</span>
              <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                className="btn-icon w-8 h-8"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day offset */}
            {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* Day cells */}
            {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
              const day = i + 1;
              const status = getDateStatus(day);
              const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
              return (
                <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative transition-all ${
                  isToday ? "ring-2 ring-blue-500 ring-offset-1 bg-blue-50" : "hover:bg-slate-50"
                }`}>
                  <span className={`${isToday ? "text-blue-700 font-bold" : "text-slate-700"}`}>{day}</span>
                  {status && status !== "weekend" && (
                    <div className={`w-2 h-2 rounded-full mt-0.5 ${statusColors[status]}`} />
                  )}
                  {status === "weekend" && <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-slate-300" />}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            {[
              { label: "Present", color: "bg-emerald-500" },
              { label: "Late", color: "bg-amber-500" },
              { label: "Absent", color: "bg-red-500" },
              { label: "Weekend", color: "bg-slate-300" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[11px] text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>


        {/* Recent Records */}
        <motion.div className="lg:col-span-5 card-enterprise overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Records</h3>
            <span className="text-xs text-slate-400">Last 7 working days</span>
          </div>
          <div className="divide-y divide-slate-100">
            {attendance.filter(a => a.status !== "weekend").slice(-7).reverse().map((record, i) => (
              <motion.div key={record.date} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  record.status === "present" ? "bg-emerald-50 border border-emerald-100" :
                  record.status === "late" ? "bg-amber-50 border border-amber-100" :
                  "bg-red-50 border border-red-100"
                }`}>
                  {record.status === "present" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                   record.status === "late" ? <Clock className="w-4 h-4 text-amber-600" /> :
                   <XCircle className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(record.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {record.checkIn && record.checkOut ? `${record.checkIn} - ${record.checkOut}` : "No record"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    record.status === "present" ? "text-emerald-700 bg-emerald-50" :
                    record.status === "late" ? "text-amber-700 bg-amber-50" :
                    "text-red-700 bg-red-50"
                  }`}>{record.status}</span>
                  {record.hours > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">{record.hours.toFixed(1)} hrs</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Attendance Rate</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {totalWorkingDays > 0 ? Math.round(((presentDays + lateDays) / totalWorkingDays) * 100) : 100}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalWorkingDays > 0 ? ((presentDays + lateDays) / totalWorkingDays) * 100 : 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
