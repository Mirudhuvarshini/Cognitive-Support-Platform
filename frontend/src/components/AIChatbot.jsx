import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Brain, Mic, MicOff, Volume2, VolumeX, Sparkles, Phone, PhoneOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QUICK_REPLIES = {
    default: ['How can you help me?', 'I need to focus', 'I feel overwhelmed', 'Guide me through breathing'],
    overwhelmed: ['Start 4-7-8 breathing', 'Play calming sounds', 'I need my caregiver', 'Show me grounding exercises'],
    focus: ['Start a 25-min timer', 'Break down my tasks', 'Tips for concentration', 'I keep getting distracted'],
    social: ['Practice a conversation', 'Help me with a script', 'Social situation advice'],
};

export default function AIChatbot() {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [quickReplyContext, setQuickReplyContext] = useState('default');
    const [voiceMode, setVoiceMode] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [pulseAnim, setPulseAnim] = useState(true);
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const voiceModeRef = useRef(false);
    const isLoadingRef = useRef(false);
    const [speechRate, setSpeechRate] = useState(0.9);

    const userName = user?.name || '';
    const initialGreeting = userName
        ? `Hi ${userName}! I'm your Neural Compass companion. I'm here to help with focus, emotional support, and daily tasks. How are you feeling right now?`
        : "Hi! I'm your Neural Compass companion. I'm here to help with focus, emotional support, and daily tasks. How can I support you today?";

    const [chatLog, setChatLog] = useState([
        { sender: 'ai', text: initialGreeting }
    ]);

    useEffect(() => {
        voiceModeRef.current = voiceMode;
    }, [voiceMode]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
                setMessage(transcript);
                if (event.results[0].isFinal) {
                    setIsListening(false);
                    if (transcript.trim()) {
                        setTimeout(() => autoSendMessage(transcript.trim()), 300);
                    }
                }
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    useEffect(() => {
        const timer = setTimeout(() => setPulseAnim(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isLoadingRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch { /* already started */ }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const speak = useCallback((text, onDone) => {
        if (!isSpeaking || !('speechSynthesis' in window)) {
            onDone?.();
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
            || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;

        setAiSpeaking(true);
        utterance.onend = () => {
            setAiSpeaking(false);
            onDone?.();
        };
        utterance.onerror = () => {
            setAiSpeaking(false);
            onDone?.();
        };
        speechSynthesis.speak(utterance);
    }, [isSpeaking, speechRate]);

    const detectContext = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('overwhelm') || lower.includes('anxious') || lower.includes('stressed') || lower.includes('panic')) return 'overwhelmed';
        if (lower.includes('focus') || lower.includes('distract') || lower.includes('concentrate')) return 'focus';
        if (lower.includes('social') || lower.includes('conversation') || lower.includes('people')) return 'social';
        return 'default';
    };

    const autoSendMessage = useCallback(async (text) => {
        if (!text) return;
        setChatLog(prev => [...prev, { sender: 'user', text }]);
        setMessage('');
        setIsLoading(true);
        setQuickReplyContext(detectContext(text));

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({ message: text, userName })
            });
            const data = await response.json();
            const aiResponse = data.response;
            setChatLog(prev => [...prev, { sender: 'ai', text: aiResponse }]);

            speak(aiResponse, () => {
                if (voiceModeRef.current) {
                    setTimeout(() => startListening(), 500);
                }
            });
        } catch {
            const fallback = "I'm having trouble connecting right now. Try some deep breathing: breathe in for 4 seconds, hold for 7, out for 8.";
            setChatLog(prev => [...prev, { sender: 'ai', text: fallback }]);
            speak(fallback, () => {
                if (voiceModeRef.current) {
                    setTimeout(() => startListening(), 500);
                }
            });
        }
        setIsLoading(false);
    }, [token, userName, speak, startListening]);

    const handleSend = async (e, quickMsg = null) => {
        if (e) e.preventDefault();
        const msgText = quickMsg || message;
        if (!msgText.trim()) return;
        autoSendMessage(msgText.trim());
    };

    const toggleVoiceMode = () => {
        if (voiceMode) {
            setVoiceMode(false);
            stopListening();
            window.speechSynthesis.cancel();
            setAiSpeaking(false);
        } else {
            setVoiceMode(true);
            setIsSpeaking(true);
            if (!isOpen) setIsOpen(true);
            setTimeout(() => startListening(), 300);
        }
    };

    return createPortal(
        <>
            {/* Floating Chat Button */}
            <button
                className={`chatbot-fab ${pulseAnim ? 'chatbot-fab-pulse' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Companion - always here for you"
                aria-label="Open AI chat"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                {!isOpen && <span className="chatbot-fab-label">Chat with me</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={`chatbot-window glass-card animate-fade-in ${voiceMode ? 'voice-mode-active' : ''}`}>
                    <div className="chatbot-header">
                        <div className="flex align-center gap-2">
                            <div className={`chatbot-avatar ${aiSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}>
                                <Brain size={22} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Neural Compass</h3>
                                <span className="chatbot-status">
                                    {aiSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening...' : isLoading ? '💭 Thinking...' : '🟢 Online'}
                                </span>
                            </div>
                        </div>
                        <div className="flex align-center gap-1">
                            <button
                                onClick={toggleVoiceMode}
                                className={`voice-mode-btn ${voiceMode ? 'active' : ''}`}
                                title={voiceMode ? 'End voice conversation' : 'Start voice conversation'}
                            >
                                {voiceMode ? <PhoneOff size={16} /> : <Phone size={16} />}
                            </button>
                            <button
                                onClick={() => setIsSpeaking(!isSpeaking)}
                                className="chatbot-icon-btn"
                                title={isSpeaking ? 'Mute voice' : 'Enable voice'}
                            >
                                {isSpeaking ? <Volume2 size={16} color="var(--color-primary)" /> : <VolumeX size={16} />}
                            </button>
                            <button onClick={() => { setIsOpen(false); if (voiceMode) toggleVoiceMode(); }} className="chatbot-icon-btn">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Voice Mode Visual */}
                    {voiceMode && (
                        <div className="voice-mode-visual">
                            <div className={`voice-orb ${aiSpeaking ? 'orb-speaking' : isListening ? 'orb-listening' : isLoading ? 'orb-thinking' : ''}`}>
                                <Brain size={40} color="white" />
                            </div>
                            <p className="voice-mode-status">
                                {aiSpeaking ? 'Neural Compass is speaking...' : isListening ? 'Listening to you...' : isLoading ? 'Thinking...' : 'Say something...'}
                            </p>
                            <button onClick={toggleVoiceMode} className="btn-secondary" style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                                <PhoneOff size={14} /> End Conversation
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="chatbot-messages" style={{ display: voiceMode ? 'none' : 'flex' }}>
                        {chatLog.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble ai typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {!voiceMode && (
                        <div className="quick-replies">
                            {(QUICK_REPLIES[quickReplyContext] || QUICK_REPLIES.default).map((qr, i) => (
                                <button key={i} className="quick-reply-btn" onClick={() => handleSend(null, qr)}>
                                    <Sparkles size={12} /> {qr}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    {!voiceMode && (
                        <form className="chatbot-input" onSubmit={handleSend}>
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`mic-btn ${isListening ? 'mic-active' : ''}`}
                                title={isListening ? 'Stop listening' : 'Speak your message'}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <input
                                type="text"
                                placeholder={isListening ? "Listening..." : "Type your message..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" disabled={isLoading} className="send-btn">
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>,
        document.body
    );
}
