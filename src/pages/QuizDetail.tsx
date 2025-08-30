import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, 
  Clock, 
  Trophy,
  Target,
  Brain,
  AlertCircle,
  Flag,
  CheckCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { QuizDetailResponse } from '../lib/api';
import { toast } from 'sonner';
import { useOffline } from '../contexts/OfflineContext';
import { useAuth } from '@/contexts/AuthContext';

const QuizDetail: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { isOnline, addToQueue } = useOffline();
  const [quiz, setQuiz] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }, []);

  // Timer functionality
  useEffect(() => {
    if (startTime && quiz && quizStarted && !showResults) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const remaining = (quiz.time_limit || quiz.estimated_duration * 60) - elapsed;
        
        if (remaining <= 0) {
          handleSubmitQuiz();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, quiz, quizStarted, showResults]);

  // Fetch quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching quiz with ID: ${quizId}`);
        
        // Hardcoded quiz data based on ID
        const quizData = getQuizById(quizId);
        
        if (quizData) {
          setQuiz(quizData);
          toast.success('Quiz loaded successfully!');
        } else {
          throw new Error('Quiz not found');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again.');
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Quiz handler functions
  const handleAnswerChange = (value: string) => {
    if (!quiz?.questions?.[currentQuestion]) return;
    setAnswers(prev => ({
      ...prev,
      [quiz.questions[currentQuestion].id]: value,
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;

    const score = calculateScore();
    const passed = score >= quiz.passing_score;

    const results = {
      quizId: quizId,
      answers,
      score,
      passed,
      startTime,
      endTime: new Date(),
      timeUsed: startTime ? Date.now() - startTime.getTime() : 0,
    };

    if (isOnline) {
      // Simulate API call
      toast.success(`Quiz completed! Score: ${score}%`);
    } else {
      addToQueue({
        type: 'quiz_result',
        data: results,
      });
      toast.info('Quiz results saved offline - will sync when online');
    }

    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setStartTime(new Date());
    setTimeLeft(quiz ? (quiz.time_limit || quiz.estimated_duration * 60) : 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const {user } = useAuth();
  const handleBack=()=>{
    if(user.role === 'admin'){

        navigate('/admin/quiz')

    }else{
         navigate('/crew/quiz')

    }
  }

  // Hardcoded quiz data
  const getQuizById = (id: string): QuizDetailResponse | null => {
    const quizzes: QuizDetailResponse[] = [
    {
      id: 'food-safety-basics',
      title: 'Food Safety Fundamentals',
      description: 'Master the essential principles of food safety, hygiene protocols, and contamination prevention',
      category: 'Food Safety',
      difficulty_level: 'Medium' as const,
      estimated_duration: 20, // 20 minutes
      total_questions: 6,
      passing_score: 70,
      time_limit: 20, // in minutes
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      questions: [
        {
          id: 'temp-danger-zone',
          type: 'multiple_choice',
          question: 'What is the temperature danger zone for food?',
          options: ['32°F - 100°F', '40°F - 140°F', '50°F - 150°F', '60°F - 160°F'],
          correct_answer: '40°F - 140°F',
          explanation: 'The temperature danger zone is 40°F to 140°F, where bacteria multiply rapidly.',
          points: 1,
        },
        {
          id: 'handwashing-time',
          type: 'multiple_choice',
          question: 'How long should you wash your hands before handling food?',
          options: ['10 seconds', '15 seconds', '20 seconds', '30 seconds'],
          correct_answer: '20 seconds',
          explanation: 'Hands should be washed for at least 20 seconds with soap and warm water.',
          points: 1,
        },
        {
          id: 'cross-contamination',
          type: 'true_false',
          question: 'It\'s safe to use the same cutting board for raw meat and vegetables if you rinse it with water.',
          correct_answer: 'false',
          explanation: 'You must wash, rinse, and sanitize cutting boards between different food types to prevent cross-contamination.',
          points: 1,
        },
        {
          id: 'allergen-protocol',
          type: 'multiple_choice',
          question: 'When a customer mentions a food allergy, what should you do first?',
          options: [
            'Continue taking their order normally',
            'Ask them to speak to a manager',
            'Take extra precautions and inform the kitchen',
            'Suggest they eat somewhere else'
          ],
          correct_answer: 'Take extra precautions and inform the kitchen',
          explanation: 'Always take allergies seriously, inform the kitchen staff, and follow allergen protocols.',
          points: 1,
        },
        {
          id: 'storage-temp',
          type: 'multiple_choice',
          question: 'What is the proper storage temperature for refrigerated foods?',
          options: ['Below 32°F (0°C)', 'Below 40°F (4°C)', 'Below 45°F (7°C)', 'Below 50°F (10°C)'],
          correct_answer: 'Below 40°F (4°C)',
          explanation: 'Refrigerated foods should be stored at or below 40°F (4°C) to prevent bacterial growth.',
          points: 1,
        },
        {
          id: 'first-in-first-out',
          type: 'true_false',
          question: 'The FIFO (First In, First Out) method helps prevent food spoilage.',
          correct_answer: 'true',
          explanation: 'FIFO ensures older products are used first, reducing waste and maintaining food quality.',
          points: 1,
        }
      ]
    },
    {
      id: 'customer-service',
      title: 'Customer Service Excellence',
      description: 'Master the art of exceptional customer service and create memorable dining experiences',
      category: 'Customer Service',
      difficulty_level: 'Medium' as const,
      estimated_duration: 16, // 16 minutes
      total_questions: 4,
      passing_score: 75,
      time_limit: 16, // in minutes
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      questions: [
        {
          id: 'greeting-time',
          type: 'multiple_choice',
          question: 'How quickly should you acknowledge a customer when they enter?',
          options: ['Within 10 seconds', 'Within 30 seconds', 'Within 1 minute', 'When convenient'],
          correct_answer: 'Within 30 seconds',
          explanation: 'Customers should be acknowledged within 30 seconds of entering to show attentiveness.',
          points: 1,
        },
        {
          id: 'upselling-appropriate',
          type: 'true_false',
          question: 'Upselling should be done aggressively to maximize sales.',
          correct_answer: 'false',
          explanation: 'Upselling should be done naturally and helpfully, focusing on customer value, not aggressive sales tactics.',
          points: 1,
        },
        {
          id: 'complaint-handling',
          type: 'multiple_choice',
          question: 'What is the best first step when handling a customer complaint?',
          options: ['Apologize immediately', 'Listen actively and empathize', 'Offer a discount', 'Call the manager'],
          correct_answer: 'Listen actively and empathize',
          explanation: 'Active listening and empathy are crucial first steps in resolving customer complaints.',
          points: 1,
        },
        {
          id: 'phone-etiquette',
          type: 'true_false',
          question: 'You should always smile when speaking to customers on the phone.',
          correct_answer: 'true',
          explanation: 'Smiling affects your tone of voice and can be "heard" over the phone, making customers feel more welcome.',
          points: 1,
        }
      ]
    },
    {
      id: 'menu-knowledge',
      title: 'Menu Knowledge & Allergies',
      description: 'Comprehensive understanding of menu items, ingredients, and allergen information',
      category: 'Menu Knowledge',
      difficulty_level: 'Hard' as const,
      estimated_duration: 24, // 24 minutes
      total_questions: 3,
      passing_score: 80,
      time_limit: 24, // in minutes
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      questions: [
        {
          id: 'major-allergens',
          type: 'multiple_choice',
          question: 'Which of the following are considered major food allergens?',
          options: ['Milk, eggs, fish', 'Tree nuts, peanuts, soy', 'Wheat, shellfish, sesame', 'All of the above'],
          correct_answer: 'All of the above',
          explanation: 'All of these are among the 9 major allergens that must be clearly identified on menus.',
          points: 1,
        },
        {
          id: 'gluten-free-prep',
          type: 'true_false',
          question: 'Gluten-free items can be prepared on the same surfaces as regular items if cleaned first.',
          correct_answer: 'false',
          explanation: 'Cross-contamination can occur even with cleaning. Separate prep areas are recommended for gluten-free items.',
          points: 1,
        },
        {
          id: 'ingredient-knowledge',
          type: 'multiple_choice',
          question: 'If a customer asks about ingredients you\'re unsure about, you should:',
          options: ['Guess based on similar dishes', 'Tell them it\'s probably fine', 'Check with the kitchen or manager', 'Suggest they order something else'],
          correct_answer: 'Check with the kitchen or manager',
          explanation: 'Never guess about ingredients, especially regarding allergies. Always verify with knowledgeable staff.',
          points: 1,
        }
      ]
    },
    {
      id: 'pos-systems',
      title: 'POS System Operations',
      description: 'Master point-of-sale system operations and payment processing procedures',
      category: 'Technology',
      difficulty_level: 'Easy' as const,
      estimated_duration: 12, // 12 minutes
      total_questions: 3,
      passing_score: 75,
      time_limit: 12, // in minutes
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      questions: [
        {
          id: 'payment-processing',
          type: 'multiple_choice',
          question: 'What should you do first when processing a credit card payment?',
          options: ['Insert the card', 'Enter the amount', 'Ask for ID', 'Print receipt'],
          correct_answer: 'Enter the amount',
          explanation: 'Always enter the correct amount first before processing any payment to ensure accuracy.',
          points: 1,
        },
        {
          id: 'receipt-policy',
          type: 'true_false',
          question: 'You should always offer a receipt to customers.',
          correct_answer: 'true',
          explanation: 'Offering receipts is standard practice for transparency and customer service.',
          points: 1,
        },
        {
          id: 'order-modification',
          type: 'multiple_choice',
          question: 'How should you handle a customer request to modify their order after it\'s been sent to the kitchen?',
          options: ['Tell them it\'s too late', 'Ignore the request', 'Check with the kitchen immediately', 'Charge extra for changes'],
          correct_answer: 'Check with the kitchen immediately',
          explanation: 'Always communicate with the kitchen promptly to see if modifications are possible.',
          points: 1,
        }
      ]
    },
    {
      id: 'emergency-procedures',
      title: 'Emergency Procedures & Safety',
      description: 'Critical knowledge for handling emergencies and maintaining workplace safety',
      category: 'Safety',
      difficulty_level: 'Hard' as const,
      estimated_duration: 15, // 15 minutes
      total_questions: 3,
      passing_score: 85,
      time_limit: 15, // in minutes
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      questions: [
        {
          id: 'fire-safety',
          type: 'multiple_choice',
          question: 'In case of a grease fire in the kitchen, you should:',
          options: ['Use water to extinguish it', 'Use a fire extinguisher', 'Turn off heat source and cover if safe', 'Run away immediately'],
          correct_answer: 'Turn off heat source and cover if safe',
          explanation: 'For grease fires, turn off heat and cover with a lid if safe to do so. Never use water on grease fires.',
          points: 1,
        },
        {
          id: 'injury-response',
          type: 'true_false',
          question: 'If someone is injured, you should move them to a safe location immediately.',
          correct_answer: 'false',
          explanation: 'Do not move an injured person unless there is immediate danger, as this could worsen injuries.',
          points: 1,
        },
        {
          id: 'choking-response',
          type: 'multiple_choice',
          question: 'If a customer is choking and cannot speak or cough, you should:',
          options: ['Give them water', 'Pat their back gently', 'Perform the Heimlich maneuver', 'Call 911 only'],
          correct_answer: 'Perform the Heimlich maneuver',
          explanation: 'If trained, perform the Heimlich maneuver immediately while someone calls 911.',
          points: 1,
        }
      ]
    }
  ]
    return quizzes.find((quiz: QuizDetailResponse) => quiz.id === id) || null;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
    setTimeLeft(quiz ? (quiz.time_limit || quiz.estimated_duration * 60) : 0);
    toast.success('Quiz started! Good luck!');
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-800">Loading Quiz...</h2>
            <p className="text-gray-600 text-center">Preparing your quiz experience...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error || !quiz) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Quiz Not Found</h2>
            <p className="text-gray-600">{error || 'The requested quiz could not be found.'}</p>
            <Button 
              onClick={handleBack} 
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <Button
            variant="outline"
         onClick={handleBack} 
            className="bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </motion.div>

        {/* Quiz Introduction */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Brain className="h-10 w-10 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
                {quiz.title}
              </CardTitle>
              
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {quiz.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quiz Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{quiz.total_questions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{quiz.time_limit || quiz.estimated_duration}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{quiz.passing_score}%</div>
                  <div className="text-sm text-gray-600">To Pass</div>
                </div>
              </div>

              {/* Instructions */}
              {quiz.instructions && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Instructions
                  </h3>
                  <p className="text-blue-700 leading-relaxed">{quiz.instructions}</p>
                </div>
              )}

              {/* Start Button */}
              <motion.div
                className="text-center pt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg"
                >
                  <Flag className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Show quiz results
  if (showResults) {
    const score = calculateScore();
    const passed = score >= (quiz?.passing_score || 0);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <Button
              variant="outline"
             onClick={handleBack} 
              className="bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </motion.div>

          <Card className="mb-6 bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <Trophy className="h-8 w-8 text-green-600" />
                ) : (
                  <X className="h-8 w-8 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {passed ? 'Congratulations!' : 'Keep Learning!'}
              </CardTitle>
              <div className="text-4xl font-bold mt-2">
                <span className={passed ? 'text-green-600' : 'text-red-600'}>
                  {score}%
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                {passed 
                  ? `You passed! (Required: ${quiz?.passing_score}%)`
                  : `You need ${quiz?.passing_score}% to pass`
                }
              </p>
            </CardHeader>
          </Card>

          {/* Question Review */}
          <Card className="mb-6 bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz?.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <Card key={question.id} className={`border-l-4 ${
                    isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            Question {index + 1}: {question.question}
                          </p>
                          
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <strong>Your answer:</strong> {userAnswer || 'Not answered'}
                            </p>
                            <p className="text-gray-600">
                              <strong>Correct answer:</strong> {question.correct_answer}
                            </p>
                          </div>
                          
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="outline" 
           onClick={handleBack} 
              className="h-12 px-6 bg-white/80 hover:bg-white"
            >
              Back to Quizzes
            </Button>
            <Button 
              onClick={handleRetakeQuiz}
              className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Quiz interface
  if (quizStarted) {
    const currentQuestionData = quiz?.questions[currentQuestion];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <Button
              variant="outline"
              onClick={() => {
                setQuizStarted(false);
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setStartTime(null);
                setTimeLeft(null);
              }}
              className="bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz Intro
            </Button>
          </motion.div>

          {/* Quiz Header */}
          <Card className="mb-6 bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{quiz?.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Question {currentQuestion + 1} of {quiz?.questions.length}
                  </p>
                </div>
                <div className="text-right">
                  {timeLeft !== null && (
                    <div className={`text-lg font-bold ${
                      timeLeft < 60 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Time Remaining</p>
                </div>
              </div>
              <Progress 
                value={((currentQuestion + 1) / (quiz?.questions.length || 1)) * 100} 
                className="h-2"
              />
            </CardHeader>
          </Card>

          {/* Question */}
          {currentQuestionData && (
            <Card className="mb-6 bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-relaxed">
                      {currentQuestionData.question}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {quiz?.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {currentQuestionData.type === 'multiple_choice' ? (
                  <RadioGroup 
                    value={answers[currentQuestionData.id] || ''} 
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {currentQuestionData.options?.map((option, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-base leading-relaxed"
                        >
                          {option}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                ) : (
                  <RadioGroup 
                    value={answers[currentQuestionData.id] || ''} 
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer text-base">True</Label>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer text-base">False</Label>
                    </motion.div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="h-12 px-6 bg-white/80 hover:bg-white"
            >
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length} of {quiz?.questions.length} answered
              </p>
            </div>

            {currentQuestion === (quiz?.questions.length || 0) - 1 ? (
              <Button 
                onClick={handleSubmitQuiz}
                className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Next
              </Button>
            )}
          </div>

          {/* Question Progress */}
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {quiz?.questions.map((_, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[quiz.questions[index].id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }
};

export default QuizDetail;