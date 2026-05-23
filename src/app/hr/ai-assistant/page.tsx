"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Sparkles, Bot, User, Clock, Zap,
  Users, CalendarCheck, TrendingUp, FileText, Shield,
  Lightbulb, BarChart3, RefreshCw, Copy, ThumbsUp,
  ThumbsDown, ChevronRight, Mic, Paperclip,
} from "lucide-react";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickPrompts = [
  { icon: Users, label: "Who is on leave today?", category: "Leave" },
  { icon: TrendingUp, label: "Show me workforce analytics", category: "Analytics" },
  { icon: CalendarCheck, label: "Pending leave approvals summary", category: "Leave" },
  { icon: FileText, label: "Generate attendance report", category: "Reports" },
  { icon: Shield, label: "Policy compliance status", category: "Compliance" },
  { icon: BarChart3, label: "Department headcount breakdown", category: "Analytics" },
];

const aiResponses: Record<string, { content: string; suggestions: string[] }> = {
  "who is on leave today": {
    content: "Based on current records, **2 employees** are on approved leave today:\n\n1. **Priya Verma** (Engineering) - Casual Leave (May 15)\n2. **Rahul Sharma** (Engineering) - Leave pending approval (May 20-21)\n\nAll other team members are available. Would you like me to send a team availability report?",
    suggestions: ["Send availability report", "Check tomorrow's schedule", "View leave calendar"],
  },
  "show me workforce analytics": {
    content: "Here's your **Workforce Analytics Summary**:\n\n📊 **Headcount**: 5 total employees\n✅ **Active**: 4 (80%)\n⏳ **On Probation**: 1 (20%)\n\n**Department Distribution**:\n- Engineering: 2 employees\n- Design: 1 employee\n- Marketing: 1 employee\n- Sales: 1 employee\n\n**Key Insight**: Engineering team has the highest headcount. Consider hiring for Design to balance workload.",
    suggestions: ["Hiring recommendations", "Attrition risk analysis", "Salary benchmarking"],
  },
  "pending leave approvals summary": {
    content: "You have **2 pending leave requests** requiring attention:\n\n🟡 **Rahul Sharma** - CL (May 20-21)\n   Reason: Personal work - bank and government office visit\n   Applied: May 18\n\n🟡 **Amit Kumar** - CL (May 22-23)\n   Reason: Family function - sister wedding ceremony\n   Applied: May 19\n\n⚡ **Recommendation**: Both requests are within policy limits. Suggest batch-approving to improve response time metrics.",
    suggestions: ["Approve all pending", "View leave balance", "Check team coverage"],
  },
  "generate attendance report": {
    content: "📋 **Attendance Report - May 2025**\n\n| Metric | Value |\n|--------|-------|\n| Working Days | 22 |\n| Avg. Attendance | 95.2% |\n| Late Check-ins | 3 instances |\n| Early Departures | 1 instance |\n\n**Top Performers (100% attendance)**:\n- Vikram Singh\n- Sneha Patel\n\n**Note**: Overall attendance is above target (90%). No action needed.",
    suggestions: ["Export as PDF", "Compare with last month", "Flag attendance issues"],
  },
  "default": {
    content: "I understand your query. Let me analyze our HR data to provide you with the most relevant insights.\n\nBased on the current workforce data, here's what I can help you with:\n\n• **Leave Management** - Track, approve, and analyze leave patterns\n• **Workforce Analytics** - Headcount, department distribution, trends\n• **Compliance** - Policy adherence, document verification status\n• **Reports** - Generate custom reports on any HR metric\n\nCould you be more specific about what you'd like to know?",
    suggestions: ["View pending tasks", "Employee directory", "Generate report"],
  },
};


function getAIResponse(query: string): { content: string; suggestions: string[] } {
  const lower = query.toLowerCase();
  for (const key of Object.keys(aiResponses)) {
    if (key !== "default" && lower.includes(key)) {
      return aiResponses[key];
    }
  }
  if (lower.includes("leave")) return aiResponses["pending leave approvals summary"];
  if (lower.includes("analytics") || lower.includes("report")) return aiResponses["show me workforce analytics"];
  if (lower.includes("attendance")) return aiResponses["generate attendance report"];
  return aiResponses["default"];
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **AI HR Assistant** powered by intelligent analytics. I can help you with leave management, workforce insights, compliance checks, and generating reports.\n\nWhat would you like to know?",
      timestamp: new Date(),
      suggestions: ["Who is on leave today?", "Workforce analytics", "Pending approvals"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const response = getAIResponse(text);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };


  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI HR Assistant</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">Online &middot; Powered by HRMS AI</span>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 card-enterprise overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg) => (
              <motion.div key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                      : "bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-md"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={`${i > 0 ? "mt-1.5" : ""} ${line.startsWith("**") ? "font-semibold" : ""}`}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                  {/* Suggestions */}
                  {msg.suggestions && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((s) => (
                        <button key={s} onClick={() => sendMessage(s)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Actions for AI messages */}
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Input Area */}
          <div className="p-4 border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about HR..."
                  className="w-full px-4 py-3 pr-20 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                  disabled={isTyping}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:shadow-none hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-2">AI responses are generated from your HR data. Always verify critical decisions.</p>
          </div>
        </div>

        {/* Quick Prompts Sidebar */}
        <div className="hidden xl:block w-72 space-y-4">
          <div className="card-enterprise p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Quick Prompts</h3>
            </div>
            <div className="space-y-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt.label} onClick={() => sendMessage(prompt.label)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group">
                  <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-colors">
                    <prompt.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{prompt.label}</p>
                    <p className="text-[10px] text-slate-400">{prompt.category}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="card-enterprise p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-slate-800">Capabilities</h3>
            </div>
            <div className="space-y-2">
              {["Leave analytics & approvals", "Workforce insights", "Policy Q&A", "Report generation", "Attendance patterns", "Hiring suggestions"].map((cap) => (
                <div key={cap} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[11px] text-slate-600">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
