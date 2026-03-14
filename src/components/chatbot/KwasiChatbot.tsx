"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "en" | "tw" | "ga" | "ee" | "ha";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "tw", name: "Twi", flag: "🇬🇭" },
  { code: "ga", name: "Ga", flag: "🇬🇭" },
  { code: "ee", name: "Ewe", flag: "🇬🇭" },
  { code: "ha", name: "Hausa", flag: "🇬🇭" },
];

const INITIAL_MESSAGES: Record<Language, string> = {
  en: "Hello! I'm Kwasi, your AI health assistant. I can help you find healthcare facilities, understand health conditions, navigate the Apomuden platform, or answer general health questions. How can I assist you today?",
  tw: "Akwaaba! Me din de Kwasi, wo AI apɔmuden boafo. Metumi aboa wo ahu ayaresabea, ate yareɛ ho nsɛm ase, kyerɛ wo Apomuden kwan, anaasɛ bua apɔmuden nsɛmmisa. Dɛn na metumi ayɛ ama wo ɛnnɛ?",
  ga: "Ojekoo! Mi ŋmɛi lɛ Kwasi, bo AI duŋ botsɛ. Miitɛŋ bɔ bo kɛ bo hu duŋ shishi, te hewale shi ase, kyerɛ bo Apomuden ŋmɛi, kɛ bua duŋ biabia. Mɛni lɛ miitɛŋ yɛ na bo enyɔ?",
  ee: "Woezɔ! Ŋkɔnye nye Kwasi, wò AI lãmesẽ kpɔɖeŋutɔ. Mate ŋu akpe ɖe ŋuwò be nàdi atikewɔƒewo, àse dɔlele gɔmewo, àzɔ Apomuden dzi, alo màɖo lãmesẽ biabia siwo nèbia ŋu. Aleke mate ŋu akpe ɖe ŋuwò egbe?",
  ha: "Sannu! Sunana Kwasi, mataimakin lafiya na AI. Zan iya taimaka maka wajen nemo asibitoci, fahimtar cututtuka, kewayawa Apomuden, ko amsa tambayoyin lafiya. Yaya zan taimaka maka yau?",
};

const QUICK_ACTIONS: Record<Language, { label: string; query: string }[]> = {
  en: [
    { label: "Find nearby hospitals", query: "Find hospitals near me" },
    { label: "Emergency services", query: "How do I request emergency services?" },
    { label: "NHIS coverage", query: "What is NHIS and how does it work?" },
    { label: "Book appointment", query: "How can I book an appointment?" },
  ],
  tw: [
    { label: "Hu ayaresabea bɛn me", query: "Hu ayaresabea bɛn me" },
    { label: "Ntɛm mmoa", query: "Meyɛ dɛn na menya ntɛm mmoa?" },
    { label: "NHIS ho nsɛm", query: "Dɛn ne NHIS na ɛyɛ adwuma sɛn?" },
    { label: "Hyɛ bere", query: "Meyɛ dɛn na mehyɛ bere?" },
  ],
  ga: [
    { label: "Hu duŋ shishi", query: "Hu duŋ shishi ni bɔ" },
    { label: "Gbɛkɛ bɔ", query: "Oyɛ dɛŋ lɛ minya gbɛkɛ bɔ?" },
    { label: "NHIS shi", query: "Mɛni lɛ NHIS kɛ oyɛ dɛŋ?" },
    { label: "Hyɛ bere", query: "Oyɛ dɛŋ lɛ mihyɛ bere?" },
  ],
  ee: [
    { label: "Di atikewɔƒe", query: "Di atikewɔƒe siwo le ɖokuiwo gbɔ" },
    { label: "Kpekpe kpɔɖeŋu", query: "Aleke mate ŋu akpɔ kpekpe kpɔɖeŋu?" },
    { label: "NHIS nyawo", query: "Nuka nye NHIS eye wòwɔa dɔ aleke?" },
    { label: "Ŋlɔ ŋkeke", query: "Aleke mate ŋu aŋlɔ ŋkeke?" },
  ],
  ha: [
    { label: "Nemo asibiti", query: "Nemo asibiti kusa da ni" },
    { label: "Sabis na gaggawa", query: "Yaya zan nemi sabis na gaggawa?" },
    { label: "Bayani game da NHIS", query: "Menene NHIS kuma yaya yake aiki?" },
    { label: "Yi alƙawari", query: "Yaya zan yi alƙawari?" },
  ],
};

export default function KwasiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: INITIAL_MESSAGES.en,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
    setMessages([{
      id: "welcome-" + lang,
      role: "assistant",
      content: INITIAL_MESSAGES[lang],
      timestamp: new Date(),
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10),
          language: language,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center safe-area-bottom"
          >
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "min(600px, calc(100vh - 6rem))",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col safe-area-bottom"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Bot className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold">Kwasi</h3>
                    <p className="text-xs text-emerald-100">AI Health Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Language Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
                      title="Change language"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-xs">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                    </button>
                    {showLanguageMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                              language === lang.code ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "assistant"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl ${
                          message.role === "assistant"
                            ? "bg-white text-gray-800 rounded-tl-none shadow-sm"
                            : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "assistant" ? "text-gray-400" : "text-emerald-200"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          <span className="text-sm text-gray-500">Kwasi is typing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t bg-white">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS[language].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.query)}
                          className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Kwasi anything..."
                      className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!input.trim() || isLoading}
                      className="rounded-full w-10 h-10 p-0 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Powered by AI • Not a substitute for professional medical advice
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
