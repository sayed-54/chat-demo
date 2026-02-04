"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function BasicUIPage() {
  const [messages, setMessages] = useState([
    { text: "Hello there!", sender: "them", time: "10:00 AM" },
    { text: "Hi, this is the basic version.", sender: "me", time: "10:01 AM" }
  ]);
  const [input, setInput] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    setMessages([...messages, { text: input, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput("");
    setTimeout(() => {
        setMessages(prev => [...prev, { text: "Received.", sender: "them", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Basic Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="font-bold text-lg">Standard Chat MVP</h1>
        </div>
        <div className="text-sm text-gray-500">v1.0.0</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Simple Sidebar */}
        <div className="w-64 bg-white border-r hidden md:block">
            <div className="p-4 border-b font-bold bg-gray-50">Contacts</div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer border-b bg-blue-50">John Doe</div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer border-b">Jane Smith</div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer border-b">Mike Ross</div>
        </div>

        {/* Basic Chat Area */}
        <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg border ${m.sender === "me" ? "bg-blue-600 text-white border-blue-700" : "bg-white text-gray-800 border-gray-200"}`}>
                            <p className="text-sm">{m.text}</p>
                            <span className="text-[10px] opacity-70 mt-1 block">{m.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Default Input Bar */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={send} className="flex gap-2">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500"
                    />
                    <button 
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Send size={16} /> Send
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
