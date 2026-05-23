"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      <div className="text-xs">
        <span className="font-semibold text-slate-700">{time}</span>
        <span className="text-slate-400 ml-2">{date}</span>
      </div>
    </div>
  );
}
