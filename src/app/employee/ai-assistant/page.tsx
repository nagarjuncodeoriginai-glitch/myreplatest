"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Sparkles, Bot, User, Clock, Zap,
  CalendarCheck, TrendingUp, FileText, Shield, Heart,
  Lightbulb, RefreshCw, Copy, ThumbsUp, ThumbsDown,
  ChevronRight, Mic, Paperclip, Calendar, Coffee,
  Wallet, HelpCircle, BookOpen, Leaf,
} from "lucide-react";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickPrompts = [
  { icon: Calendar, label: "How many leaves do I have left?", category: "Leave" },
  { icon: CalendarCheck, label: "Check my leave status", category: "Leave" },
  { icon: Wallet, label: "When is my next salary date?", category: "Payroll" },
  { icon: Shield, label: "What is the leave policy?", category: "Policy" },
  { icon: Coffee, label: "What are office timings?", category: "General" },
  { icon: Heart, label: "Employee wellness benefits", category: "Benefits" },
  { icon: BookOpen, label: "How to apply for leave?", category: "Guide" },
  { icon: HelpCircle, label: "Who is my reporting manager?", category: "Team" },
];

const aiResponses: Record<string, { content: string; suggestions: string[] }> = {
  "how many leaves": {
    content: "Based on your current balance for **May 2025**:\n\n🟢 **Remaining CL**: 1 day\n🔵 **Total CL**: 2 days/month\n🟡 **Used CL**: 1 day\n\n📌 **Note**: Your leaves reset on the 1st of every month. You have 1 CL remaining that you can use before May 31.\n\nWould you like to apply for leave?",
    suggestions: ["Apply for leave", "View leave history", "Check next month balance"],
  },
  "leave status": {
    content: "Here's your **Leave Application Status**:\n\n🟡 **Pending** - May 20-21 (Personal work)\n   Applied: May 18 | Awaiting HR review\n\n✅ **Approved** - May 10 (Feeling unwell)\n   Approved by: HR Admin on May 9\n\nYou have 1 pending request. HR typically reviews within 24 hours.",
    suggestions: ["Cancel pending leave", "Apply new leave", "Contact HR"],
  },
  "salary": {
    content: "💰 **Salary Information**:\n\n• **Pay Date**: Last working day of every month\n• **Next Payment**: May 31, 2025\n• **Mode**: Direct bank transfer\n\n📄 Your salary slip is automatically generated and available in your profile after each pay cycle.\n\n*For salary-related queries, please contact the Finance team.*",
    suggestions: ["View my profile", "Download payslip", "Tax declaration"],
  },
  "leave policy": {
    content: "📋 **Leave Policy Summary**:\n\n**Casual Leave (CL)**:\n• 2 days per month allocated\n• Does NOT carry forward to next month\n• Reset on 1st of every month\n• Minimum 10 character reason required\n\n**Application Rules**:\n• Apply at least 1 day in advance (planned)\n• Cannot apply for past dates\n• HR reviews within 24 hours\n• Maximum consecutive: 2 days\n\n**Need more details?** Ask me about specific scenarios!",
    suggestions: ["Apply for leave", "Emergency leave process", "Holiday calendar"],
  },
  "office timings": {
    content: "🏢 **Office Timings & Work Schedule**:\n\n⏰ **Standard Shift**: 9:00 AM - 6:00 PM\n🍽️ **Lunch Break**: 1:00 PM - 2:00 PM\n📅 **Working Days**: Monday - Friday\n🏠 **Work From Home**: As per manager approval\n\n**Flex hours available**: You can adjust ±1 hour with prior manager approval.\n\n*Your specific shift timing is listed in your profile.*",
    suggestions: ["Check my shift", "Request WFH", "View holidays"],
  },
  "wellness": {
    content: "💚 **Employee Wellness Benefits**:\n\n🧘 **Mental Health**\n• Free counseling sessions (4/month)\n• Meditation app subscription\n\n🏋️ **Physical Health**\n• Gym membership reimbursement (₹2000/month)\n• Annual health checkup (covered)\n\n🎯 **Work-Life Balance**\n• Flexible work hours\n• Birthday leave (1 day)\n• Wellness Wednesday (early close at 4 PM)\n\nWant to enroll in any program?",
    suggestions: ["Enroll in gym benefit", "Book counseling", "View all benefits"],
  },
  "apply for leave": {
    content: "📝 **How to Apply for Leave**:\n\n**Step 1**: Go to 'Apply Leave' from sidebar\n**Step 2**: Select start and end date\n**Step 3**: The system calculates days automatically\n**Step 4**: Write your reason (min 10 characters)\n**Step 5**: Click 'Submit Application'\n\n⚡ **Quick tip**: You can also use the 'Quick Apply' button in the sidebar for faster access!\n\nHR will review within 24 hours and you'll see the status update.",
    suggestions: ["Apply now", "Check my balance", "View leave history"],
  },
  "manager": {
    content: "👤 **Your Reporting Structure**:\n\n• **Reporting Manager**: Priya Verma\n• **Department**: Engineering\n• **Team Size**: 3 members\n\n📧 For escalations, reach out to your manager directly or contact HR.\n\n*This information is based on your employee profile.*",
    suggestions: ["View team members", "Contact HR", "Update profile"],
  },
  "default": {
    content: "I'm here to help! As your **AI Employee Assistant**, I can answer questions about:\n\n• 📅 **Leave** - Balance, apply, status, policy\n• 💰 **Payroll** - Salary dates, payslips, tax\n• 🏢 **Workplace** - Timings, policies, facilities\n• 💚 **Benefits** - Wellness, insurance, perks\n• 👥 **Team** - Manager, colleagues, structure\n• 📋 **Processes** - How to apply, request, report\n\nWhat would you like to know?",
    suggestions: ["Leave balance", "Office timings", "Leave policy"],
  },
};


function getAIResponse(query: string): { content: string; suggestions: string[] } {
  const lower = query.toLowerCase();
  if (lower.includes("leave") && (lower.includes("how many") || lower.includes("balance") || lower.includes("left"))) return aiResponses["how many leaves"];
  if (lower.includes("status") || lower.includes("check my leave")) return aiResponses["leave status"];
  if (lower.includes("salary") || lower.includes("pay") || lower.includes("payslip")) return aiResponses["salary"];
  if (lower.includes("policy") || lower.includes("rules")) return aiResponses["leave policy"];
  if (lower.includes("timing") || lower.includes("office") || lower.includes("shift") || lower.includes("schedule")) return aiResponses["office timings"];
  if (lower.includes("wellness") || lower.includes("benefit") || lower.includes("health") || lower.includes("gym")) return aiResponses["wellness"];
  if (lower.includes("apply") || lower.includes("how to")) return aiResponses["apply for leave"];
  if (lower.includes("manager") || lower.includes("reporting") || lower.includes("team")) return aiResponses["manager"];
  return aiResponses["default"];
}

export default function EmployeeAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! 👋 I'm your **Personal HR Assistant**. I can help you with leave balances, policies, salary info, benefits, and much more.\n\nHow can I help you today?",
      timestamp: new Date(),
      suggestions: ["Leave balance", "Leave policy", "Office timings", "Apply for leave"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 600));

    const response = getAIResponse(text);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response.content, timestamp: new Date(), suggestions: response.suggestions };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };


  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">My HR Assistant</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">Always available &middot; Instant answers</span>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Messages Panel */}
        <div className="flex-1 card-enterprise overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg) => (
              <motion.div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md"
                      : "bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-md"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={`${i > 0 ? "mt-1.5" : ""} ${line.startsWith("**") ? "font-semibold" : ""}`}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                  {msg.suggestions && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((s) => (
                        <button key={s} onClick={() => sendMessage(s)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..." disabled={isTyping}
                  className="w-full px-4 py-3 pr-20 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><Paperclip className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><Mic className="w-4 h-4" /></button>
                </div>
              </div>
              <motion.button type="submit" disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:shadow-none hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-2">Your personal HR helper. Ask about leaves, policies, benefits & more.</p>
          </div>
        </div>

        {/* Sidebar - Quick Prompts */}
        <div className="hidden xl:block w-72 space-y-4">
          <div className="card-enterprise p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Ask Me About</h3>
            </div>
            <div className="space-y-1.5">
              {quickPrompts.map((prompt) => (
                <button key={prompt.label} onClick={() => sendMessage(prompt.label)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group">
                  <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center flex-shrink-0 transition-colors">
                    <prompt.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{prompt.label}</p>
                    <p className="text-[10px] text-slate-400">{prompt.category}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="card-enterprise p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-800">I Can Help With</h3>
            </div>
            <div className="space-y-2">
              {["Leave balance & applications", "Company policies & rules", "Salary & payslip queries", "Benefits & wellness info", "Office timings & holidays", "Manager & team info", "How-to guides & processes"].map((cap) => (
                <div key={cap} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
