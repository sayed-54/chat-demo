"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Send, Menu, Phone, Video, MoreVertical, X, Circle, Paperclip, Smile, Mic, Search, Settings, 
  Filter, CheckCheck, Trash2, Bell, Moon, Sun, Volume2, Shield, Heart, ThumbsUp, Laugh, Star, 
  User as UserIcon, LogOut, Edit3, Ban, UserCheck, ChevronRight
} from "lucide-react";

// --- Types ---
type MessageStatus = "sent" | "delivered" | "read";
type Reaction = { emoji: string; count: number };
type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: Date;
  status: MessageStatus;
  reactions?: Reaction[];
  isSystem?: boolean;
};

type UserStatus = "online" | "offline" | "away";
type User = {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  recentMessage?: string;
  isBlocked?: boolean;
};

// --- Initial Data ---
const INITIAL_USERS: User[] = [
  { id: "u2", name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", status: "online", recentMessage: "Sounds good!" },
  { id: "u3", name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", status: "away", recentMessage: "I'll check it later." },
  { id: "u4", name: "Mike Ross", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", status: "online", recentMessage: "The design is 🔥" },
  { id: "u5", name: "Rachel Zane", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel", status: "offline", lastSeen: "5m ago", recentMessage: "See you tomorrow!" },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  "u2": [
    { id: "m2-0", text: "Secure channel established", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 60), status: "read", isSystem: true },
    { id: "m2-1", text: "Hey! How's the new project coming along?", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 15), status: "read" },
    { id: "m2-2", text: "It's going great! Just working on the chat UI.", sender: "me", timestamp: new Date(Date.now() - 1000 * 60 * 10), status: "read", reactions: [{ emoji: "🚀", count: 1 }] },
    { id: "m2-3", text: "Nice! Let me know if you need any feedback.", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 5), status: "read" },
  ],
  "u3": [{ id: "m3-1", text: "Can we review the docs today?", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 60), status: "read" }],
  "u4": [{ id: "m4-1", text: "Did you see the new Tailwind updates?", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: "read" }],
  "u5": [{ id: "m5-1", text: "Have a great weekend!", sender: "them", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: "read" }]
};

const RESPONSE_CATEGORIES = {
  questions: [
    "That's a great question! I think we should check the docs.",
    "Hmm, I'm not entirely sure, let me verify that for you.",
    "Could you elaborate on that part?",
    "Why do you ask? Did something change? 🤔",
  ],
  agreements: [
    "Exactly! I was thinking the same thing.",
    "100% agreed. Let's move forward with that.",
    "That makes perfect sense to me.",
    "Couldn't have said it better myself. 🔥",
  ],
  casual: [
    "Haha, that's hilarious! 😂",
    "I'm actually just grabbing some coffee now, talk in a bit?",
    "Nice! Keep up the good work.",
    "Understood. I'll get back to you soon.",
    "Sounds like a plan!",
  ],
  tech: [
    "The hydration logic in React 19 is actually pretty interesting...",
    "Vite is so much faster than Webpack, don't you think?",
    "Are we using Tailwind v4 for this? The new @theme is sick.",
    "I just pushed some updates to the main branch. 💻",
  ]
};

// --- Main Component ---
export default function QuickChatPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState("u2");
  const [conversations, setConversations] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "away">("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNicknameEditing, setIsNicknameEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState("Sayed");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeUser = useMemo(() => users.find(u => u.id === activeUserId) || users[0], [activeUserId, users]);
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, statusFilter, users]);

  const activeMessages = conversations[activeUserId] || [];

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, typingUsers, activeUserId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || activeUser.isBlocked) return;

    const userText = inputValue;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: "me",
      timestamp: new Date(),
      status: "sent",
    };

    const currentActiveId = activeUserId;
    setConversations(prev => ({
      ...prev,
      [currentActiveId]: [...(prev[currentActiveId] || []), newMessage]
    }));
    setInputValue("");

    // --- Simulation Logic ---
    setTimeout(() => {
      setConversations(prev => ({
        ...prev,
        [currentActiveId]: (prev[currentActiveId] || []).map(m => m.id === newMessage.id ? { ...m, status: "delivered" } : m)
      }));
    }, 800);

    setTimeout(() => {
      setTypingUsers(prev => new Set(prev).add(currentActiveId));
    }, 1500);

    setTimeout(() => {
      let category = "casual";
      if (userText.includes("?")) category = "questions";
      else if (userText.toLowerCase().includes("agree") || userText.toLowerCase().includes("yes")) category = "agreements";
      else if (userText.toLowerCase().includes("code") || userText.toLowerCase().includes("build")) category = "tech";
      
      const responses = RESPONSE_CATEGORIES[category as keyof typeof RESPONSE_CATEGORIES];
      const responseText = responses[Math.floor(Math.random() * responses.length)];

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "them",
        timestamp: new Date(),
        status: "read",
      };
      
      setConversations(prev => ({
        ...prev,
        [currentActiveId]: [
          ...(prev[currentActiveId] || []).map(m => m.sender === "me" ? { ...m, status: "read" as const } : m),
          responseMessage
        ]
      }));
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(currentActiveId);
        return next;
      });
    }, 4500);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setConversations(prev => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] || []).map(m => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions || [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
        }
        return { ...m, reactions: [...reactions, { emoji, count: 1 }] };
      })
    }));
  };

  const toggleFilter = () => {
    const sequence: ("all" | "online" | "away")[] = ["all", "online", "away"];
    const currentIndex = sequence.indexOf(statusFilter);
    setStatusFilter(sequence[(currentIndex + 1) % sequence.length]);
  };

  // --- Contact Actions ---
  const toggleBlock = () => {
    setUsers(prev => prev.map(u => 
      u.id === activeUserId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
    setIsMenuOpen(false);
  };

  const updateNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    setUsers(prev => prev.map(u => 
      u.id === activeUserId ? { ...u, name: nicknameInput } : u
    ));
    setIsNicknameEditing(false);
    setIsMenuOpen(false);
  };

  const startNicknameEdit = () => {
    setNicknameInput(activeUser.name);
    setIsNicknameEditing(true);
  };

  const clearChat = () => {
    setConversations(prev => ({ ...prev, [activeUserId]: [] }));
    setIsMenuOpen(false);
  };

  // --- Theme Variables ---
  const theme = {
    bg: isDarkMode ? "bg-[#020617]" : "bg-[#F8FAFC]",
    sidebar: isDarkMode ? "bg-slate-900/60" : "bg-white/80",
    border: isDarkMode ? "border-slate-800/50" : "border-slate-200/60",
    textMain: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-500" : "text-slate-400",
    inputBg: isDarkMode ? "bg-slate-800/40" : "bg-slate-100/80",
    bubbleMe: isDarkMode ? "bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-cyan-500/20" : "bg-gradient-to-br from-cyan-450 to-blue-550 shadow-cyan-400/20",
    bubbleThem: isDarkMode ? "bg-slate-800/50" : "bg-white shadow-sm border border-slate-100",
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-all duration-700 ease-in-out ${theme.bg} ${theme.textMain}`}>
      
      {/* --- SETTINGS MODAL --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-[340px] ${isDarkMode ? "bg-slate-900" : "bg-white"} shadow-[0_0_50px_rgba(0,0,0,0.1)] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-r ${theme.border} ${isSettingsOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>Settings</h2>
            <button onClick={() => setIsSettingsOpen(false)} className={`p-2.5 hover:bg-slate-500/10 rounded-2xl transition-all ${theme.textMuted}`}><X size={20} /></button>
          </div>
          
          <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] px-2">Profile</label>
               <div className={`p-4 rounded-3xl border ${theme.border} ${theme.inputBg} focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all`}>
                  <div className="flex items-center gap-3 mb-2 opacity-50"><UserIcon size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Your Display Name</span></div>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-transparent border-none text-base font-bold focus:outline-none"
                    placeholder="Enter name..."
                  />
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] px-2">Appearance</label>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full flex items-center justify-between p-5 rounded-3xl border ${theme.border} ${theme.inputBg} hover:opacity-80 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${isDarkMode ? "bg-slate-700" : "bg-amber-100"}`}>
                    {isDarkMode ? <Moon size={20} className="text-cyan-400" /> : <Sun size={20} className="text-amber-500" />}
                  </div>
                  <span className="font-bold text-[15px]">{isDarkMode ? "Deep Dark" : "Soft Light"}</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isDarkMode ? "bg-cyan-600" : "bg-slate-300"}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] px-2">Privacy</label>
              <div className="p-5 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 text-cyan-500 flex items-center gap-4">
                <Shield size={22} className="shrink-0" />
                <div>
                   <div className="text-sm font-black uppercase tracking-widest leading-none mb-1">Encrypted</div>
                   <div className="text-[10px] opacity-70 font-medium">Safe & secure chat protocol v4</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-700/20">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">QuickChat v2.5 Enterprise</p>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-full max-w-[320px] ${theme.sidebar} backdrop-blur-3xl border-r ${theme.border} transform transition-transform duration-500 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter">QUICKY.</h1>
              <button onClick={() => setIsSettingsOpen(true)} className={`p-3 rounded-[20px] ${isDarkMode ? "bg-slate-800/50" : "bg-white shadow-xl border border-slate-100"} hover:text-cyan-50 transition-all group active:scale-95`}>
                <Settings size={22} className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
              </button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${theme.inputBg} border border-transparent focus:border-cyan-500/30 rounded-[22px] py-4 pl-12 pr-4 text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all shadow-inner`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-6">
            <div className="px-3 mb-4 flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Conversations</label>
              <button 
                onClick={toggleFilter}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-slate-500/10 text-slate-400" : statusFilter === "online" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
              >
                <Filter size={10} /> {statusFilter}
              </button>
            </div>

            {filteredUsers.map(user => {
              const active = activeUserId === user.id;
              const typing = typingUsers.has(user.id);
              return (
                <div key={user.id} onClick={() => { setActiveUserId(user.id); setIsSidebarOpen(false); }} className={`flex items-center gap-4 p-5 rounded-[28px] transition-all cursor-pointer group relative mb-1 ${active ? "bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/10 shadow-2xl" : "hover:bg-slate-500/5 border border-transparent"}`}>
                  <div className="relative shrink-0">
                    <img src={user.avatar} alt="" className={`w-13 h-13 rounded-[22px] border-2 transition-all duration-300 group-hover:rotate-6 ${active ? "border-cyan-500 shadow-lg shadow-cyan-500/10" : "border-slate-800/10"}`} />
                    <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-[4px] shadow-sm ${isDarkMode ? "border-slate-900" : "border-white"} ${user.status === "online" ? "bg-emerald-500" : user.status === "away" ? "bg-amber-500" : "bg-slate-300"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                         {user.isBlocked && <Ban size={10} className="text-rose-500 shrink-0" />}
                         <h3 className={`font-black truncate text-[15px] tracking-tight ${active ? "text-cyan-500" : isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{user.name}</h3>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">12:45 PM</span>
                    </div>
                    <p className={`text-[12px] truncate font-bold leading-none ${typing ? "text-cyan-400 animate-pulse" : theme.textMuted}`}>
                      {typing ? "is typing..." : user.isBlocked ? "Contact blocked" : user.recentMessage}
                    </p>
                  </div>
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-cyan-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.6)]" />}
                </div>
              );
            })}
          </div>

          <div className="p-5 mt-auto">
             <div className={`flex items-center gap-4 p-5 rounded-[28px] border ${theme.border} ${isDarkMode ? "bg-slate-800/20" : "bg-white shadow-xl shadow-slate-200/50"}`}>
                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-xl shadow-indigo-500/20">{userName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                   <div className="text-[15px] font-black truncate tracking-tight">{userName}</div>
                   <div className="text-[9px] text-emerald-500 font-black flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> Active
                   </div>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-500">
        {/* Header */}
        <header className={`h-20 md:h-26 px-4 md:px-10 border-b ${theme.border} flex items-center justify-between ${isDarkMode ? "bg-slate-900/40" : "bg-white/80"} backdrop-blur-3xl sticky top-0 z-20`}>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-3 rounded-2xl ${theme.inputBg} text-slate-500`}><Menu size={20} /></button>
            <div className="relative group cursor-pointer transition-transform hover:scale-105">
               <img src={activeUser.avatar} className={`w-13 h-13 rounded-[22px] border-2 ${activeUser.status === "online" ? "border-emerald-500/30" : "border-slate-500/30"} shadow-2xl transition-all`} alt="" />
               <div className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full border-[4px] shadow-sm ${isDarkMode ? "border-slate-900" : "border-white"} ${activeUser.status === "online" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            </div>
            <div>
              <h2 className="font-black text-2xl tracking-tighter leading-none mb-1 flex items-center gap-2">
                {activeUser.name}
                {activeUser.isBlocked && <Ban size={16} className="text-rose-500" />}
              </h2>
              <div className="flex items-center gap-2">
                {typingUsers.has(activeUserId) ? (
                  <div className="text-cyan-500 text-[11px] font-black uppercase tracking-[2px] flex items-center gap-3 animate-pulse">
                    <span className="flex gap-1"><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" /></span>
                    Thinking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeUser.status === "online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"}`} />
                    <span className={`text-[11px] font-black uppercase tracking-[2.5px] ${theme.textMuted}`}>
                      {activeUser.isBlocked ? "Blocked" : activeUser.status === "online" ? "Active" : "Away"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <button className={`hidden sm:flex p-4 rounded-[22px] ${theme.inputBg} hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/20 active:scale-90`}><Phone size={22} /></button>
            <button className={`hidden sm:flex p-4 rounded-[22px] ${theme.inputBg} hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/20 active:scale-90`}><Video size={22} /></button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-4 rounded-[22px] ${theme.inputBg} transition-all active:scale-90 relative ${isMenuOpen ? "text-cyan-500 bg-cyan-500/10" : "text-slate-500"}`}>
              <MoreVertical size={22} />
            </button>

            {/* --- CONTEXT DROPDOWN --- */}
            {isMenuOpen && (
              <div className={`absolute top-full right-0 mt-4 w-64 ${isDarkMode ? "bg-slate-900/90" : "bg-white"} backdrop-blur-2xl border ${theme.border} rounded-[32px] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-50 animate-in zoom-in origin-top-right overflow-hidden`}>
                 <div className="p-4 border-b border-slate-700/20 mb-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Actions</p>
                    <p className="text-[13px] font-bold truncate">Managing {activeUser.name}</p>
                 </div>
                 
                 <div className="space-y-1">
                    {isNicknameEditing ? (
                      <form onSubmit={updateNickname} className="p-2">
                         <input 
                           autoFocus
                           value={nicknameInput}
                           onChange={(e) => setNicknameInput(e.target.value)}
                           className={`w-full ${theme.inputBg} border border-cyan-500/30 rounded-2xl py-2 px-3 text-[13px] font-bold focus:outline-none mb-2`}
                         />
                         <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-cyan-600 text-[11px] font-black uppercase tracking-widest py-2 rounded-xl text-white">Save</button>
                            <button type="button" onClick={() => setIsNicknameEditing(false)} className="flex-1 bg-slate-700 text-[11px] font-black uppercase tracking-widest py-2 rounded-xl text-white">Cancel</button>
                         </div>
                      </form>
                    ) : (
                      <button onClick={startNicknameEdit} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-500/10 rounded-[22px] transition-all group text-left">
                        <div className="flex items-center gap-3"><Edit3 size={18} className="text-slate-400" /><span className="text-[13px] font-bold">Change Nickname</span></div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    <button onClick={toggleBlock} className={`w-full flex items-center justify-between p-3.5 hover:bg-rose-500/10 rounded-[22px] transition-all group text-left ${activeUser.isBlocked ? "text-emerald-500" : "text-rose-500"}`}>
                      <div className="flex items-center gap-3">
                        {activeUser.isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
                        <span className="text-[13px] font-bold">{activeUser.isBlocked ? "Unblock Contact" : "Block Contact"}</span>
                      </div>
                    </button>

                    <button onClick={clearChat} className="w-full flex items-center justify-between p-3.5 hover:bg-slate-500/10 rounded-[22px] transition-all group text-left">
                      <div className="flex items-center gap-3"><Trash2 size={18} className="text-slate-400" /><span className="text-[13px] font-bold">Clear Conversation</span></div>
                    </button>
                 </div>
              </div>
            )}
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-16 py-6 md:py-10 space-y-8 md:space-y-12 custom-scrollbar scroll-smooth relative">
          {activeMessages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 select-none pointer-events-none">
               <Shield size={120} className="mb-6" />
               <p className="text-xl font-black uppercase tracking-[10px]">Pure Privacy</p>
            </div>
          )}

          <div className="flex justify-center flex-col items-center gap-4 mb-10 md:mb-20">
             <div className={`w-[2.5px] h-10 md:h-20 bg-gradient-to-b from-transparent ${isDarkMode ? "to-slate-800" : "to-slate-200"}`} />
             <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[4px] md:tracking-[8px] px-4 md:px-8 py-2 md:py-3 rounded-full border shadow-2xl ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-400"}`}>
               {activeUser.isBlocked ? "Contact Status: Blocked" : "Verified End-to-End"}
             </span>
          </div>

          {activeUser.isBlocked && (
            <div className="flex justify-center py-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl mx-10 animate-in">
               <p className="text-[12px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-3">
                 <Ban size={16} /> You have blocked this contact. Unblock to resume chat.
               </p>
            </div>
          )}

          {activeMessages.map((msg) => (
            msg.isSystem ? (
              <div key={msg.id} className="flex justify-center"><span className={`text-[11px] font-black uppercase tracking-[3px] py-2.5 px-8 rounded-full ${isDarkMode ? "bg-slate-800/30 text-slate-600 border border-slate-700/20" : "bg-slate-100 text-slate-400 border border-slate-200/50"}`}>{msg.text}</span></div>
            ) : (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} group relative animate-in`}>
                <div className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
                  <div className={`relative px-8 py-5 rounded-[36px] shadow-2xl transition-all duration-500 ${msg.sender === "me" ? `${theme.bubbleMe} text-white rounded-br-none` : `${theme.bubbleThem} rounded-bl-none`}`}>
                    <p className={`text-[16px] leading-[1.7] font-medium selection:bg-white/20 ${msg.sender === "me" ? "text-white" : isDarkMode ? "text-slate-100" : "text-slate-800"}`}>{msg.text}</p>
                    
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`absolute -bottom-5 flex gap-1.5 ${msg.sender === "me" ? "right-4" : "left-4"}`}>
                        {msg.reactions.map((r, i) => (
                          <div key={i} className={`${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-xl"} border px-3 py-1 rounded-full text-[12px] flex items-center gap-2 animate-in zoom-in hover:scale-110 transition-transform`}>
                            <span>{r.emoji}</span> {r.count > 1 && <span className="text-[10px] font-black opacity-60">{r.count}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1.5 md:gap-3 p-1 md:p-2 rounded-full shadow-2xl z-10 ${isDarkMode ? "bg-slate-950 border border-slate-800" : "bg-white border shadow-2xl"} ${msg.sender === "me" ? "-left-20 md:-left-40" : "-right-20 md:-right-40"}`}>
                       {["❤️", "👍", "😂", "🔥"].map((emoji, i) => (
                         <button key={i} onClick={() => addReaction(msg.id, emoji)} className="p-1 px-2.5 hover:bg-slate-500/10 rounded-full text-[16px] transform hover:scale-150 transition-all active:scale-95">{emoji}</button>
                       ))}
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 mt-4 px-3 ${msg.sender === "me" ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60 select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === "me" && (
                      <div className={`flex items-center p-1 rounded-full ${isDarkMode ? "bg-slate-800/30" : "bg-slate-100"}`}>
                        <CheckCheck size={14} className={`${msg.status === "read" ? "text-cyan-500" : "text-slate-400"} transition-colors`} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ))}

          {typingUsers.has(activeUserId) && !activeUser.isBlocked && (
            <div className="flex justify-start animate-in">
              <div className={`${isDarkMode ? "bg-slate-800/40" : "bg-white shadow-xl border border-slate-100"} backdrop-blur-3xl p-7 rounded-[32px] rounded-bl-none flex items-center gap-3 shadow-2xl`}>
                <div className="flex gap-2.5">
                   <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                   <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
                   <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-bounce shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="pt-10" />
        </div>

        {/* Input Bar */}
        <div className={`p-4 md:p-14 ${isDarkMode ? "bg-gradient-to-t from-slate-900 to-transparent" : "bg-gradient-to-t from-white to-transparent"}`}>
          <div className={`${activeUser.isBlocked ? "opacity-30 pointer-events-none grayscale" : ""} max-w-4xl mx-auto p-2 md:p-3.5 ${isDarkMode ? "bg-slate-800/60" : "bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100"} backdrop-blur-3xl rounded-[32px] md:rounded-[48px] border ${theme.border} transition-all duration-300 shadow-2xl focus-within:ring-4 focus-within:ring-cyan-500/10`}>
             <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4">
                <button type="button" className={`p-2.5 md:p-4 rounded-full transition-all ${theme.textMuted} hover:text-cyan-500 hover:bg-slate-500/10`}><Paperclip size={20} className="md:w-[26px] md:h-[26px]" /></button>
                <input 
                  type="text" 
                  value={inputValue}
                  disabled={activeUser.isBlocked}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={activeUser.isBlocked ? "Blocked" : `Message...`}
                  className={`flex-1 bg-transparent border-none text-[15px] md:text-[18px] font-medium py-3 md:py-4 focus:outline-none ${isDarkMode ? "text-white placeholder-slate-600" : "text-slate-900 placeholder-slate-400"}`}
                />
                <div className="flex items-center gap-1 md:gap-2 px-1 md:px-2">
                  <button type="button" className={`hidden sm:block p-4 rounded-full transition-all ${theme.textMuted} hover:text-cyan-500 hover:bg-slate-500/10`}><Smile size={26} /></button>
                  {inputValue.trim() ? (
                    <button type="submit" className="p-3 md:p-4 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white rounded-[20px] md:rounded-[32px] shadow-2xl shadow-blue-500/20 transform hover:scale-105 active:scale-95 transition-all"><Send size={20} className="md:w-[26px] md:h-[26px]" fill="currentColor" /></button>
                  ) : (
                    <button type="button" className={`p-2.5 md:p-4 rounded-full transition-all ${theme.textMuted} hover:text-cyan-500 hover:bg-slate-500/10`}><Mic size={20} className="md:w-[26px] md:h-[26px]" /></button>
                  )}
                </div>
             </form>
          </div>
          <div className="flex justify-center gap-6 md:gap-12 mt-6 md:mt-12 select-none opacity-40">
             <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black tracking-[3px] md:tracking-[5px] uppercase"><Shield size={12} /> P2P Layer</div>
             <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black tracking-[3px] md:tracking-[5px] uppercase"><Circle size={8} fill="currentColor" className="text-emerald-500" /> Active</div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.3); }
        
        @keyframes slideInUp { 
          from { opacity: 0; transform: translateY(40px) scale(0.96); filter: blur(15px); } 
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
        }
        .animate-in { animation: slideInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes zoomIn { 
          from { opacity: 0; transform: scale(0.3); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .zoom-in { animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
