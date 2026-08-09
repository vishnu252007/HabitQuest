import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  X,
  Flame,
  CheckCircle2,
  PlusCircle,
  Settings,
  Key,
} from 'lucide-react';
import { processVoiceCommand, type AgentResponse } from '../services/agentService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionTaken?: string;
}

export default function VoiceAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: 'Hi there! I am QuestAI, your Voice Assistant 🎙️. You can speak or type to add habits, check off completed tasks, or view your streaks hands-free!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [pendingContext, setPendingContext] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('habit_tracker_gemini_key');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (savedKey) {
      setGeminiApiKey(savedKey);
    } else if (envKey) {
      setGeminiApiKey(envKey);
      localStorage.setItem('habit_tracker_gemini_key', envKey);
    }
  }, []);

  // Save API key when updated
  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('habit_tracker_gemini_key', key);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleUserCommand(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [transcript, pendingContext]);

  // Speak text aloud via SpeechSynthesis
  const speakText = (textToSpeak: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Process User Command (Voice or Text)
  const handleUserCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTranscript('');

    // Process via Agent Service
    const agentRes: AgentResponse = await processVoiceCommand(commandText, pendingContext, geminiApiKey);

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      text: agentRes.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTaken: agentRes.actionTaken,
    };

    setMessages((prev) => [...prev, agentMsg]);

    if (agentRes.needsClarification) {
      setPendingContext(agentRes.needsClarification);
    } else {
      setPendingContext(null);
    }

    if (agentRes.speakMessage) {
      speakText(agentRes.speakMessage);
    }
  };

  // Toggle Mic Listening
  const toggleListening = () => {
    if (!isOpen) setIsOpen(true);

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserCommand(inputText);
    }
  };

  return (
    <>
      {/* ── FLOATING VOICE MIC ACTION BUTTON (FAB) ── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Glow Ring Pulse when listening */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-rose-500/40 blur-md pointer-events-none"
            />
          )}

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) toggleListening();
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 cursor-pointer relative ${
              isListening
                ? 'bg-rose-600 shadow-rose-500/50 animate-pulse'
                : 'bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 shadow-rose-500/30'
            }`}
            title="QuestAI Voice Assistant"
          >
            {isListening ? (
              <div className="flex items-center justify-center gap-1">
                <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <Mic className="w-6 h-6" />
            )}

            {/* Sparkle Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3 text-slate-900 fill-slate-900" />
            </span>
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE VOICE ASSISTANT CHAT POPOVER ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header Bar */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                    QuestAI Assistant
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-[9px] font-bold">
                      {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Hands-free habit voice control</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Settings Gear Toggle */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'text-amber-400 bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                  title="Voice Agent Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Mute/Unmute Voice Response Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-900 border-b border-slate-800 p-4 text-xs text-white space-y-2 overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Key className="w-3.5 h-3.5" />
                    <span>Gemini AI Engine Settings</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Enter your Gemini API key below to unlock advanced conversational AI, semantic logic, and natural spelling autocorrect!
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => saveApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    {geminiApiKey && (
                      <button
                        onClick={() => saveApiKey('')}
                        className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {geminiApiKey ? (
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Gemini 1.5 Flash Enabled (Advanced Mode)</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-medium">
                      Running on Offline Fuzzy Matcher (Basic Mode)
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-rose-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-rose-600 text-white font-medium rounded-tr-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right font-medium ${
                        msg.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Listening Transcript Live Display */}
              {isListening && transcript && (
                <div className="flex gap-2.5 flex-row-reverse animate-pulse">
                  <div className="max-w-[80%] rounded-2xl p-3 bg-rose-100 text-rose-800 border border-rose-200 font-medium italic">
                    "{transcript}..."
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <button
                onClick={() => handleUserCommand('Add habit Drink Water 20 points')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3 h-3 text-rose-500" />
                <span>+ Add Drink Water</span>
              </button>

              <button
                onClick={() => handleUserCommand('What is my streak?')}
                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold whitespace-nowrap flex items-center gap-1 transition-colors border border-amber-200/60 cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>🔥 Check Streak</span>
              </button>

              <button
                onClick={() => handleUserCommand('How is my progress?')}
                className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap flex items-center gap-1 transition-colors border border-emerald-200/60 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>📊 View Progress</span>
              </button>
            </div>

            {/* Text & Mic Input Form */}
            <form onSubmit={handleTextSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Type a command or speak...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
