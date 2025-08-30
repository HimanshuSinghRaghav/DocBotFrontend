import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Send, User, Volume2, VolumeX, Mic, MicOff, Settings } from 'lucide-react';
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
    } catch (error) {
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
      toast.success('Response received!');
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
    navigate('/crew');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="minimal-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-4 w-px bg-border"></div>
              <h1 className="text-lg font-medium text-foreground">AI Training Assistant</h1>
            </div>
            
            {/* Voice Selection */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedVoice?.name || ''} onValueChange={(value) => {
                  const voice = availableVoices.find(v => v.name === value);
                  setSelectedVoice(voice || null);
                }}>
                  <SelectTrigger className="w-48 minimal-input">
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
      </div>

      {/* Chat Messages */}
      <div className="minimal-container h-[calc(100vh-8rem)] flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className={`h-8 w-8 ${message.isUser ? 'ml-2' : 'mr-2'}`}>
                    <AvatarFallback className={message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                      {message.isUser ? (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />) : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'minimal-card'
                      }`}
                    >
                      {message.isUser ? (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        <div className="text-sm leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {!message.isUser && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakingMessageId === message.id ? stopSpeaking() : speakText(message.text, message.id)}
                            className="h-6 w-6 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          >
                            {speakingMessageId === message.id ? (
                              <div className="flex space-x-1">
                                <div className="w-1 h-3 bg-destructive rounded-full animate-bounce"></div>
                                <div className="w-1 h-3 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 h-3 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-muted text-muted-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div className="minimal-card px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <Card className="rounded-none border-t border-border/50">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              {/* Microphone Button */}
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={isListening ? stopListening : startListening}
                disabled={hasMicrophonePermission === false}
                className="shrink-0 h-10 w-10 border-border/50 hover:bg-muted/50"
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening... Speak now!" : "Ask me anything about procedures, safety, or training..."}
                className="flex-1 h-10 minimal-input"
                disabled={isListening}
              />
              
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isTyping || isListening}
                size="icon"
                className="shrink-0 h-10 w-10 minimal-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Speech-to-Text Status */}
            {isListening && (
              <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="font-medium">Listening... {transcript && `"${transcript}"`}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrewChat;
