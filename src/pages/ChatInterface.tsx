import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, User, Bot, Clock, Check, CheckCheck, Volume2, VolumeX, Settings, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechRecognition: any;
  }
}

interface APIResponse {
  query: string;
  answer: string;
  procedure_mode: boolean;
  language: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you find information from your SOP documents. Ask me anything about safety procedures, equipment handling, or any other operational topics!',
      sender: 'bot',
      timestamp: new Date(Date.now() - 60000),
      status: 'read'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [documentIds, setDocumentIds] = useState<number[]>([1, 2]); // Configurable document IDs
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Make API call to the documents query endpoint
      const apiUrl = 'https://9765cebb345d.ngrok-free.app'; // Using the same base URL from DocumentUploadPage
      const response = await axios.post<APIResponse>(`${apiUrl}/api/documents/query`, {
        query: inputValue,
        // document_ids: documentIds, // Using configurable document IDs
        procedure_mode: true,
        include_audio: false,
        language: "en"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        timeout: 30000
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, botMessage]);
      toast.success('Response received from AI');
    } catch (error: any) {
      console.error('API error:', error);
      
      let errorMessage = "I'm sorry, I couldn't process your request at the moment.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.detail || 'Request failed';
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, errorBotMessage]);
      toast.error('Failed to get response from AI');
    } finally {
      setIsTyping(false);
      
      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Load available voices when component mounts
  useEffect(() => {
    loadVoices();
    
    // Handle voice loading events
    const handleVoicesChanged = () => {
      loadVoices();
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
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
      } catch (error) {
        // Permission API not supported, we'll check when user tries to use it
        console.log('Permission API not supported, will check on first use');
        // Don't set to false, let it remain null so user can try
      }
    };
    
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
      // toast.error('Text-to-speech failed');
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
    if (hasMicrophonePermission === null) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }
    } else if (hasMicrophonePermission === false) {
      toast.error('Microphone access denied. Please allow microphone permissions and try again.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      toast.success('Listening... Speak now!');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setTranscript('');
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access blocked. Please allow microphone permissions in your browser settings and try again.');
      } else if (event.error === 'permission-denied') {
        toast.error('Microphone permission denied. Please check your browser settings.');
      } else {
        toast.error('Speech recognition failed. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        setInputValue(transcript.trim());
        toast.success('Speech captured successfully!');
      }
    };

    recognition.start();
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

  const stopListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if ((window as any).speechRecognition) {
        (window as any).speechRecognition.stop();
      }
    }
    setIsListening(false);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/bot-avatar.png" alt="Bot" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {isTyping ? 'Typing...' : 'Online'}
                </Badge>
                {user && (
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                )}
                
                {/* Voice Selector */}
                <div className="flex items-center space-x-2 ml-4">
                  <Settings className="h-3 w-3 text-gray-500" />
                  <Select value={selectedVoice?.name || ''} onValueChange={(value) => {
                    const voice = availableVoices.find(v => v.name === value);
                    setSelectedVoice(voice || null);
                  }}>
                    <SelectTrigger className="h-7 w-32 text-xs voice-selector">
                      <SelectValue placeholder="Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name} className="text-xs">
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                 <Avatar className="h-8 w-8 flex-shrink-0">
                   <AvatarImage 
                     src={message.sender === 'user' ? undefined : "/bot-avatar.png"} 
                     alt={message.sender === 'user' ? 'User' : 'Bot'} 
                   />
                   <AvatarFallback className={message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                     {message.sender === 'user' ? (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />) : <Bot className="h-4 w-4" />}
                   </AvatarFallback>
                 </Avatar>
                
                                <div className={`rounded-lg px-3 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.sender === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="chat-prose">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                      
                      {/* Text-to-Speech Button - Right Aligned */}
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (speakingMessageId === message.id) {
                              stopSpeaking();
                            } else {
                              speakText(message.content, message.id);
                            }
                          }}
                          className="h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-600 tts-button"
                        >
                          {speakingMessageId === message.id ? (
                            <>
                              <div className="flex items-center space-x-1">
                                <div className="flex space-x-1">
                                  <div className="w-1 h-3 bg-blue-500 rounded-full wave-animation"></div>
                                  <div className="w-1 h-3 bg-blue-500 rounded-full wave-animation"></div>
                                  <div className="w-1 h-3 bg-blue-500 rounded-full wave-animation"></div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3 w-3 mr-1" />
                              
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex items-center space-x-1 mt-1 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === 'user' && (
                      <span className="ml-1">
                        {getStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening... Speak now!" : "Type your message..."}
              className="flex-1"
              disabled={isListening}
            />
            
          
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isTyping || isListening}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
