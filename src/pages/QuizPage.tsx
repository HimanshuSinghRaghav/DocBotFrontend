import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  X, 
  RotateCcw,
  Trophy,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  time_limit: number; // in seconds
  passingScore: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { t } = useLanguage();
  const { isOnline, addToQueue } = useOffline();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const quizzes: Quiz[] = [
    {
      id: 'food-safety-basics',
      title: 'Food Safety Fundamentals',
      description: 'Master the essential principles of food safety, hygiene protocols, and contamination prevention',
      category: 'Food Safety',
      time_limit: 1200, // 20 minutes
      passingScore: 70,
      questions: [
        {
          id: 'temp-danger-zone',
          type: 'mcq',
          question: 'What is the temperature danger zone for food?',
          options: ['32°F - 100°F', '40°F - 140°F', '50°F - 150°F', '60°F - 160°F'],
          correctAnswer: '40°F - 140°F',
          explanation: 'The temperature danger zone is 40°F to 140°F, where bacteria multiply rapidly.',
          difficulty: 'easy',
          category: 'Temperature Control',
        },
        {
          id: 'handwashing-time',
          type: 'mcq',
          question: 'How long should you wash your hands before handling food?',
          options: ['10 seconds', '15 seconds', '20 seconds', '30 seconds'],
          correctAnswer: '20 seconds',
          explanation: 'Hands should be washed for at least 20 seconds with soap and warm water.',
          difficulty: 'easy',
          category: 'Hygiene',
        },
        {
          id: 'cross-contamination',
          type: 'true_false',
          question: 'It\'s safe to use the same cutting board for raw meat and vegetables if you rinse it with water.',
          correctAnswer: 'false',
          explanation: 'You must wash, rinse, and sanitize cutting boards between different food types to prevent cross-contamination.',
          difficulty: 'medium',
          category: 'Food Safety',
        },
        {
          id: 'allergen-protocol',
          type: 'mcq',
          question: 'When a customer mentions a food allergy, what should you do first?',
          options: [
            'Continue taking their order normally',
            'Ask them to speak to a manager',
            'Take extra precautions and inform the kitchen',
            'Suggest they eat somewhere else'
          ],
          correctAnswer: 'Take extra precautions and inform the kitchen',
          explanation: 'Always take allergies seriously, inform the kitchen staff, and follow allergen protocols.',
          difficulty: 'medium',
          category: 'Customer Safety',
        },
        {
          id: 'storage-temp',
          type: 'mcq',
          question: 'What is the proper storage temperature for refrigerated foods?',
          options: ['Below 32°F (0°C)', 'Below 40°F (4°C)', 'Below 45°F (7°C)', 'Below 50°F (10°C)'],
          correctAnswer: 'Below 40°F (4°C)',
          explanation: 'Refrigerated foods should be stored at or below 40°F (4°C) to prevent bacterial growth.',
          difficulty: 'easy',
          category: 'Temperature Control',
        },
        {
          id: 'first-in-first-out',
          type: 'true_false',
          question: 'The FIFO (First In, First Out) method helps prevent food spoilage.',
          correctAnswer: 'true',
          explanation: 'FIFO ensures older products are used first, reducing waste and maintaining food quality.',
          difficulty: 'easy',
          category: 'Food Safety',
        }
      ]
    },
    {
      id: 'customer-service',
      title: 'Customer Service Excellence',
      description: 'Master the art of exceptional customer service and create memorable dining experiences',
      category: 'Customer Service',
      time_limit: 960, // 16 minutes
      passingScore: 75,
      questions: [
        {
          id: 'greeting-time',
          type: 'mcq',
          question: 'How quickly should you acknowledge a customer when they enter?',
          options: ['Within 10 seconds', 'Within 30 seconds', 'Within 1 minute', 'When convenient'],
          correctAnswer: 'Within 30 seconds',
          explanation: 'Customers should be acknowledged within 30 seconds of entering to show attentiveness.',
          difficulty: 'easy',
          category: 'Service Standards',
        },
        {
          id: 'upselling-appropriate',
          type: 'true_false',
          question: 'Upselling should be done aggressively to maximize sales.',
          correctAnswer: 'false',
          explanation: 'Upselling should be done naturally and helpfully, focusing on customer value, not aggressive sales tactics.',
          difficulty: 'medium',
          category: 'Sales Techniques',
        },
        {
          id: 'complaint-handling',
          type: 'mcq',
          question: 'What is the best first step when handling a customer complaint?',
          options: ['Apologize immediately', 'Listen actively and empathize', 'Offer a discount', 'Call the manager'],
          correctAnswer: 'Listen actively and empathize',
          explanation: 'Active listening and empathy are crucial first steps in resolving customer complaints.',
          difficulty: 'medium',
          category: 'Service Standards',
        },
        {
          id: 'phone-etiquette',
          type: 'true_false',
          question: 'You should always smile when speaking to customers on the phone.',
          correctAnswer: 'true',
          explanation: 'Smiling affects your tone of voice and can be "heard" over the phone, making customers feel more welcome.',
          difficulty: 'easy',
          category: 'Communication',
        }
      ]
    },
    {
      id: 'menu-knowledge',
      title: 'Menu Knowledge & Allergies',
      description: 'Comprehensive understanding of menu items, ingredients, and allergen information',
      category: 'Menu Knowledge',
      time_limit: 1440, // 24 minutes
      passingScore: 80,
      questions: [
        {
          id: 'major-allergens',
          type: 'mcq',
          question: 'Which of the following are considered major food allergens?',
          options: ['Milk, eggs, fish', 'Tree nuts, peanuts, soy', 'Wheat, shellfish, sesame', 'All of the above'],
          correctAnswer: 'All of the above',
          explanation: 'All of these are among the 9 major allergens that must be clearly identified on menus.',
          difficulty: 'medium',
          category: 'Allergens',
        },
        {
          id: 'gluten-free-prep',
          type: 'true_false',
          question: 'Gluten-free items can be prepared on the same surfaces as regular items if cleaned first.',
          correctAnswer: 'false',
          explanation: 'Cross-contamination can occur even with cleaning. Separate prep areas are recommended for gluten-free items.',
          difficulty: 'hard',
          category: 'Allergens',
        },
        {
          id: 'ingredient-knowledge',
          type: 'mcq',
          question: 'If a customer asks about ingredients you\'re unsure about, you should:',
          options: ['Guess based on similar dishes', 'Tell them it\'s probably fine', 'Check with the kitchen or manager', 'Suggest they order something else'],
          correctAnswer: 'Check with the kitchen or manager',
          explanation: 'Never guess about ingredients, especially regarding allergies. Always verify with knowledgeable staff.',
          difficulty: 'easy',
          category: 'Menu Knowledge',
        }
      ]
    },
    {
      id: 'pos-systems',
      title: 'POS System Operations',
      description: 'Master point-of-sale system operations and payment processing procedures',
      category: 'Technology',
      time_limit: 720, // 12 minutes
      passingScore: 75,
      questions: [
        {
          id: 'payment-processing',
          type: 'mcq',
          question: 'What should you do first when processing a credit card payment?',
          options: ['Insert the card', 'Enter the amount', 'Ask for ID', 'Print receipt'],
          correctAnswer: 'Enter the amount',
          explanation: 'Always enter the correct amount first before processing any payment to ensure accuracy.',
          difficulty: 'easy',
          category: 'Payment Processing',
        },
        {
          id: 'receipt-policy',
          type: 'true_false',
          question: 'You should always offer a receipt to customers.',
          correctAnswer: 'true',
          explanation: 'Offering receipts is standard practice for transparency and customer service.',
          difficulty: 'easy',
          category: 'Customer Service',
        },
        {
          id: 'order-modification',
          type: 'mcq',
          question: 'How should you handle a customer request to modify their order after it\'s been sent to the kitchen?',
          options: ['Tell them it\'s too late', 'Ignore the request', 'Check with the kitchen immediately', 'Charge extra for changes'],
          correctAnswer: 'Check with the kitchen immediately',
          explanation: 'Always communicate with the kitchen promptly to see if modifications are possible.',
          difficulty: 'medium',
          category: 'Order Management',
        }
      ]
    },
    {
      id: 'emergency-procedures',
      title: 'Emergency Procedures & Safety',
      description: 'Critical knowledge for handling emergencies and maintaining workplace safety',
      category: 'Safety',
      time_limit: 900, // 15 minutes
      passingScore: 85,
      questions: [
        {
          id: 'fire-safety',
          type: 'mcq',
          question: 'In case of a grease fire in the kitchen, you should:',
          options: ['Use water to extinguish it', 'Use a fire extinguisher', 'Turn off heat source and cover if safe', 'Run away immediately'],
          correctAnswer: 'Turn off heat source and cover if safe',
          explanation: 'For grease fires, turn off heat and cover with a lid if safe to do so. Never use water on grease fires.',
          difficulty: 'hard',
          category: 'Fire Safety',
        },
        {
          id: 'injury-response',
          type: 'true_false',
          question: 'If someone is injured, you should move them to a safe location immediately.',
          correctAnswer: 'false',
          explanation: 'Do not move an injured person unless there is immediate danger, as this could worsen injuries.',
          difficulty: 'medium',
          category: 'First Aid',
        },
        {
          id: 'choking-response',
          type: 'mcq',
          question: 'If a customer is choking and cannot speak or cough, you should:',
          options: ['Give them water', 'Pat their back gently', 'Perform the Heimlich maneuver', 'Call 911 only'],
          correctAnswer: 'Perform the Heimlich maneuver',
          explanation: 'If trained, perform the Heimlich maneuver immediately while someone calls 911.',
          difficulty: 'hard',
          category: 'First Aid',
        }
      ]
    }
  ];

  const currentQuiz = quizzes.find(q => q.id === selectedQuiz);
  const currentQuestionData = currentQuiz?.questions[currentQuestion];

  React.useEffect(() => {
    if (startTime && currentQuiz && !showResults) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const remaining = currentQuiz.time_limit - elapsed;
        
        if (remaining <= 0) {
          handleSubmitQuiz();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, currentQuiz, showResults]);

  const handleAnswerChange = (value: string) => {
    if (!currentQuestionData) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuiz && currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;

    const score = calculateScore();
    const passed = score >= currentQuiz.passingScore;

    const results = {
      quizId: selectedQuiz,
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
    if (!currentQuiz) return 0;
    
    let correct = 0;
    currentQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / currentQuiz.questions.length) * 100);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setStartTime(new Date());
    setTimeLeft(currentQuiz?.time_limit || 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('quiz')}</h1>
            <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <Badge variant="outline">{quiz.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{Math.round(quiz.time_limit / 60)} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span>{quiz.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-gray-500" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => {
                      setSelectedQuiz(quiz.id);
                      setStartTime(new Date());
                      setTimeLeft(quiz.time_limit);
                    }}
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= (currentQuiz?.passingScore || 0);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
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
                  ? `You passed! (Required: ${currentQuiz?.passingScore}%)`
                  : `You need ${currentQuiz?.passingScore}% to pass`
                }
              </p>
            </CardHeader>
          </Card>

          {/* Question Review */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuiz?.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
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
                              <strong>Correct answer:</strong> {question.correctAnswer}
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
              onClick={() => setSelectedQuiz(null)}
              className="h-12 px-6"
            >
              Back to Quizzes
            </Button>
            <Button 
              onClick={handleRetakeQuiz}
              className="h-12 px-6"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Quiz Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{currentQuiz?.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Question {currentQuestion + 1} of {currentQuiz?.questions.length}
                </p>
              </div>
              <div className="text-right">
                {timeLeft !== null && (
                  <div className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </div>
                )}
                <p className="text-xs text-gray-500">Time Remaining</p>
              </div>
            </div>
            <Progress 
              value={((currentQuestion + 1) / (currentQuiz?.questions.length || 1)) * 100} 
              className="h-2"
            />
          </CardHeader>
        </Card>

        {/* Question */}
        {currentQuestionData && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestionData.question}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="ml-4">
                  {currentQuestionData.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {currentQuestionData.type === 'mcq' ? (
                <RadioGroup 
                  value={answers[currentQuestionData.id] || ''} 
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestionData.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer text-base leading-relaxed"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup 
                  value={answers[currentQuestionData.id] || ''} 
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="flex-1 cursor-pointer text-base">True</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="flex-1 cursor-pointer text-base">False</Label>
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="h-12 px-6"
          >
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {Object.keys(answers).length} of {currentQuiz?.questions.length} answered
            </p>
          </div>

          {currentQuestion === (currentQuiz?.questions.length || 0) - 1 ? (
            <Button 
              onClick={handleSubmitQuiz}
              className="h-12 px-6 bg-green-600 hover:bg-green-700"
            >
              {t('submit')} Quiz
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="h-12 px-6"
            >
              {t('next')}
            </Button>
          )}
        </div>

        {/* Question Progress */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {currentQuiz?.questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[currentQuiz.questions[index].id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}