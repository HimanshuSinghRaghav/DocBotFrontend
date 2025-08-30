import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Send, User, Volume2, Mic, MicOff, Settings, Bot, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const CrewChat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI training assistant. I can help you with questions about procedures, safety protocols, menu items, and more. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Text-to-Speech states
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Speech-to-Text states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  // GSAP entrance animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }
  }, []);

  // Helper function to check if browser supports microphone
  const isMicrophoneSupported = (): boolean => {
    const hasModern = !!navigator.mediaDevices?.getUserMedia;
    const hasLegacy = !!(navigator as any).getUserMedia;
    const hasWebkit = !!(navigator as any).webkitGetUserMedia;
    const hasMoz = !!(navigator as any).mozGetUserMedia;
    const hasMs = !!(navigator as any).msGetUserMedia;
    
    const isSupported = !!(hasModern || hasLegacy || hasWebkit || hasMoz || hasMs);
    
    console.log('Microphone support check:', {
      hasModern,
      hasLegacy,
      hasWebkit,
      hasMoz,
      hasMs,
      isSupported,
      navigator: navigator,
      mediaDevices: navigator.mediaDevices
    });
    
    return isSupported;
  };

  // Check microphone permission status
  const checkMicrophonePermission = async () => {
    // Check if browser supports microphone access - be more lenient
    if (!isMicrophoneSupported()) {
      console.log('Microphone not supported in this browser');
      setHasMicrophonePermission(false);
      return;
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'granted') {
        setHasMicrophonePermission(true);
      } else if (result.state === 'denied') {
        setHasMicrophonePermission(false);
      }
      // 'prompt' state means we haven't asked yet, so keep as null
    } catch {
      // Permission API not supported, we'll check when user tries to use it
      console.log('Permission API not supported, will check on first use');
      // Don't set to false, let it remain null so user can try
    }
  };

  // Load available voices when component mounts
  useEffect(() => {
    loadVoices();
    
    // Handle voice loading events
    const handleVoicesChanged = () => {
      loadVoices();
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Check microphone permission status
    checkMicrophonePermission();
    
    // Cleanup speech synthesis when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    
    // Auto-select a female voice if available
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('alex')
    );
    
    if (femaleVoice) {
      setSelectedVoice(femaleVoice);
    } else if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  };

  const speakText = (text: string, messageId: string) => {
    // Stop any currently speaking text
    if (speakingMessageId) {
      window.speechSynthesis.cancel();
    }

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower than normal
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Set selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set speaking state
    setSpeakingMessageId(messageId);
    
    // Handle speech events
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeakingMessageId(null);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
  };

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    // Check if we already have microphone permission
    if (hasMicrophonePermission === false) {
      // Try to request permission again
      await requestMicrophonePermission();
      return;
    }

    try {
      // Pre-flight check for microphone permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        toast.success('Listening... Speak now!');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setTranscript(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.');
          setHasMicrophonePermission(false);
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'network') {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please allow microphone permissions in your browser settings.');
        setHasMicrophonePermission(false);
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
        setHasMicrophonePermission(false);
      } else {
        toast.error('Microphone error: ' + error.message);
        setHasMicrophonePermission(false);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // Stop any active recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback for older browsers
      const getUserMedia = (navigator as any).getUserMedia || 
                          (navigator as any).webkitGetUserMedia || 
                          (navigator as any).mozGetUserMedia || 
                          (navigator as any).msGetUserMedia;
      
      if (!getUserMedia) {
        toast.error('Microphone access not supported in this browser. Please use a modern browser.');
        setHasMicrophonePermission(false);
        return false;
      }
      
      // Use legacy getUserMedia
      return new Promise((resolve) => {
        getUserMedia.call(navigator, { audio: true }, 
          (stream: MediaStream) => {
            stream.getTracks().forEach(track => track.stop());
            setHasMicrophonePermission(true);
            toast.success('Microphone access granted!');
            resolve(true);
          },
          (error: any) => {
            handleLegacyGetUserMediaError(error);
            resolve(false);
          }
        );
      });
    }
    
    // Modern getUserMedia approach
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setHasMicrophonePermission(true);
      toast.success('Microphone access granted!');
      return true;
    } catch (error: any) {
      return handleModernGetUserMediaError(error);
    }
  };

  const handleLegacyGetUserMediaError = (error: any) => {
    console.error('Legacy getUserMedia error:', error);
    setHasMicrophonePermission(false);
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      toast.error('Microphone access denied. Please allow microphone permissions in your browser settings.');
    } else if (error.name === 'NotFoundError') {
      toast.error('No microphone found. Please connect a microphone and try again.');
    } else if (error.name === 'NotSupportedError') {
      toast.error('Microphone not supported in this browser.');
    } else {
      toast.error('Microphone error: ' + (error.message || 'Unknown error'));
    }
  };

  const handleModernGetUserMediaError = (error: any): boolean => {
    console.error('Modern getUserMedia error:', error);
    setHasMicrophonePermission(false);
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      toast.error('Microphone access denied. Please allow microphone permissions in your browser settings.');
    } else if (error.name === 'NotFoundError') {
      toast.error('No microphone found. Please connect a microphone and try again.');
    } else if (error.name === 'NotSupportedError') {
      toast.error('Microphone not supported in this browser.');
    } else if (error.name === 'NotReadableError') {
      toast.error('Microphone is already in use by another application.');
    } else {
      toast.error('Microphone error: ' + (error.message || 'Unknown error'));
    }
    
    return false;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const apiUrl = 'https://9765cebb345d.ngrok-free.app';
      const response = await axios.post(`${apiUrl}/api/documents/query`, {
        query: inputValue.trim(),
        document_ids: ['1', '2', '3'], // Default document IDs
        procedure_mode: true,
        language: 'en',
        include_audio: false
      });
      console.log(response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer || 'I apologize, but I couldn\'t process your request at the moment.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to get response. Please try again.';
      toast.error(errorMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBack = () => {
    toast.success('Returning to dashboard...');
      if(user?.role === 'admin'){

                      navigate('/admin')
}else{

  navigate('/crew');
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
      {/* Header Section */}
      <motion.div 
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-blue-200/50 shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-white/80 border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </motion.div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">AI Training Assistant</h1>
                  <p className="text-gray-600">Get instant answers and guidance</p>
                </div>
              </div>
            </div>
            
            {/* Voice Selection and Status */}
            <div className="flex items-center space-x-4">
             
              
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <Select value={selectedVoice?.name || ''} onValueChange={(value) => {
                  const voice = availableVoices.find(v => v.name === value);
                  setSelectedVoice(voice || null);
                }}>
                  <SelectTrigger className="w-48 bg-white/80 border-gray-300 rounded-xl">
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Messages Container */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-6">
             
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                    >
                      <Avatar className={`h-12 w-12 ${message.isUser ? 'ml-4' : 'mr-4'} shadow-lg`}>
                        <AvatarFallback className={`${message.isUser 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'} font-bold text-lg`}>
                          {message.isUser ? (
                            user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="h-6 w-6" />
                          ) : (
                            <Bot className="h-6 w-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-2xl px-6 py-4 shadow-lg ${message.isUser
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'}`}
                      >
                        {message.isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-lg">
                           
                            {message.text}</p>
                        ) : (
                          <div className="text-base leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               
                              {"Hey Satish, \n \n" +  message.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </motion.div>
                      
                      <div className="flex items-center space-x-3 mt-3">
                        <span className="text-sm text-gray-500 font-medium">
                          {formatTime(message.timestamp)}
                        </span>
                        
                        {!message.isUser && (
                          <div className="flex items-center space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakingMessageId === message.id ? stopSpeaking() : speakText(message.text, message.id)}
                                className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-gray-100 shadow-md border border-gray-200"
                              >
                                {speakingMessageId === message.id ? (
                                  <motion.div 
                                    className="flex space-x-1"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                  >
                                    <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </motion.div>
                                ) : (
                                  <Volume2 className="h-4 w-4 text-gray-600" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[80%]">
                    <Avatar className="h-12 w-12 mr-4 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
                      <div className="flex space-x-2">
                        <motion.div 
                          className="w-3 h-3 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-3 h-3 bg-purple-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-3 h-3 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Enhanced Input Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-lg border-t border-blue-200/50 shadow-lg p-6 mt-auto"
        >
          {/* Quick Suggestions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-purple-600" />
              Quick Suggestions
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                "What are the safety protocols?",
                "How do I handle emergencies?",
                "Menu item ingredients",
                "Cleaning procedures"
              ].map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(99 102 241)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInputValue(suggestion)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-xl text-sm font-medium hover:text-white transition-all duration-300 shadow-md border border-blue-200"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="flex space-x-4">
            {/* Enhanced Microphone Button */}
       
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening... Speak now!" : "Ask me anything about procedures, safety, or training..."}
              className="flex-1 h-14 px-6 text-lg bg-white/80 border-2 border-blue-200 rounded-xl shadow-lg focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              disabled={isListening}
            />
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isTyping || isListening}
                size="lg"
                className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg border-0 transition-all duration-300 disabled:opacity-50"
              >
                {isTyping ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <>
                  Ask
                 <Sparkles className="h-6 w-6" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
          {/* Enhanced Speech-to-Text Status */}
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-4 rounded-xl shadow-md border border-blue-200"
            >
              <div className="flex space-x-2">
                <motion.div 
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-3 h-3 bg-pink-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-800 text-lg">🎤 Listening...</div>
                {transcript && (
                  <div className="text-purple-700 font-medium mt-1">
                    "{transcript}"
                  </div>
                )}
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Mic className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
};

export default CrewChat;
