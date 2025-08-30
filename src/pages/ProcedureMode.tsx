import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Info,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import CountUp from 'react-countup';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  estimatedTime: number; // in seconds
  safetyNote?: string;
}

interface Procedure {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: ProcedureStep[];
}

export default function ProcedureMode() {
  const { t } = useLanguage();
  const { isOnline, addToQueue } = useOffline();
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');

  const procedures: Procedure[] = [
    {
      id: 'food-prep',
      title: 'Food Preparation Safety',
      description: 'Essential steps for safe food preparation',
      category: 'Food Safety',
      estimatedTime: 900, // 15 minutes
      difficulty: 'beginner',
      steps: [
        {
          id: 'wash-hands',
          title: 'Wash Hands Thoroughly',
          description: 'Wash hands with soap and warm water for at least 20 seconds',
          required: true,
          estimatedTime: 30,
          safetyNote: 'Critical step - never skip hand washing'
        },
        {
          id: 'sanitize-surface',
          title: 'Sanitize Work Surface',
          description: 'Clean and sanitize the work surface with approved sanitizer',
          required: true,
          estimatedTime: 60,
        },
        {
          id: 'check-ingredients',
          title: 'Check Ingredient Quality',
          description: 'Inspect all ingredients for freshness and proper temperature',
          required: true,
          estimatedTime: 120,
        },
        {
          id: 'prep-tools',
          title: 'Prepare Tools and Equipment',
          description: 'Gather and sanitize all necessary tools and equipment',
          required: true,
          estimatedTime: 90,
        },
        {
          id: 'temperature-check',
          title: 'Temperature Verification',
          description: 'Verify refrigerator and freezer temperatures are within safe ranges',
          required: true,
          estimatedTime: 30,
          safetyNote: 'Refrigerator: 32-40°F, Freezer: 0°F or below'
        },
      ]
    },
    {
      id: 'customer-service',
      title: 'Customer Order Process',
      description: 'Step-by-step customer service protocol',
      category: 'Customer Service',
      estimatedTime: 600, // 10 minutes
      difficulty: 'intermediate',
      steps: [
        {
          id: 'greet-customer',
          title: 'Greet Customer',
          description: 'Smile, make eye contact, and welcome the customer warmly',
          required: true,
          estimatedTime: 15,
        },
        {
          id: 'take-order',
          title: 'Take Order Accurately',
          description: 'Listen carefully, repeat back order, ask about allergies',
          required: true,
          estimatedTime: 120,
        },
        {
          id: 'suggest-items',
          title: 'Suggest Complementary Items',
          description: 'Offer appropriate sides, drinks, or desserts',
          required: false,
          estimatedTime: 30,
        },
        {
          id: 'process-payment',
          title: 'Process Payment',
          description: 'Handle payment accurately and provide receipt',
          required: true,
          estimatedTime: 60,
        },
        {
          id: 'thank-customer',
          title: 'Thank Customer',
          description: 'Express gratitude and provide order pickup information',
          required: true,
          estimatedTime: 15,
        },
      ]
    }
  ];

  const currentProcedure = procedures.find(p => p.id === selectedProcedure);

  const currentStepData = currentProcedure?.steps[currentStep];

  // Initialize timer when step changes
  useEffect(() => {
    if (currentStepData) {
      setTimeLeft(currentStepData.estimatedTime);
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return prev;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentStep, currentStepData]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, showTooltip]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    toast.success("Step marked as completed!");
  };

  const handleStepIncomplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
    toast.info("Step marked as incomplete");
  };

  const handleNext = () => {
    if (currentProcedure && currentStep < currentProcedure.steps.length - 1) {
      setAnimationDirection('right');
      setCurrentStep(prev => prev + 1);
      setShowTooltip(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setAnimationDirection('left');
      setCurrentStep(prev => prev - 1);
      setShowTooltip(false);
    }
  };

  const handleRepeat = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStartTime(new Date());
    setShowTooltip(true);
    setAnimationDirection('left');
    toast.info('Starting procedure from the beginning');
  };

  const handleComplete = () => {
    const completionData = {
      procedureId: selectedProcedure,
      completedSteps: Array.from(completedSteps),
      startTime,
      endTime: new Date(),
      duration: startTime ? Date.now() - startTime.getTime() : 0,
    };

    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    if (isOnline) {
      // Simulate API call
      toast.success('Procedure completed successfully! 🎉', {
        description: 'Great job completing all steps!',
        duration: 5000,
      });
    } else {
      addToQueue({
        type: 'procedure_completion',
        data: completionData,
      });
      toast.info('Completion recorded offline - will sync when online', {
        description: 'Your progress has been saved locally',
        duration: 5000,
      });
    }
  };

  const getProgressPercentage = () => {
    if (!currentProcedure) return 0;
    return Math.round((completedSteps.size / currentProcedure.steps.length) * 100);
  };

  if (!selectedProcedure) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <TooltipProvider>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('procedures')}</h1>
              <p className="text-gray-600">Select a procedure to begin step-by-step training</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {procedures.map((procedure, index) => (
                <motion.div
                  key={procedure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <motion.div 
                          whileHover={{ rotate: 15 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        </motion.div>
                        <Badge variant={
                          procedure.difficulty === 'beginner' ? 'secondary' :
                          procedure.difficulty === 'intermediate' ? 'default' : 'destructive'
                        }>
                          {procedure.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{procedure.title}</CardTitle>
                      <CardDescription>{procedure.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 cursor-help">
                              <Clock className="h-4 w-4" />
                              <span>{Math.round(procedure.estimatedTime / 60)} minutes</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estimated time to complete</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{procedure.steps.length} steps</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This procedure contains {procedure.steps.length} steps</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <Button 
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        onClick={() => {
                          setSelectedProcedure(procedure.id);
                          setStartTime(new Date());
                          toast.success(`Starting: ${procedure.title}`);
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="flex items-center"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Procedure
                        </motion.div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </div>
    );
  }

  const isLastStep = currentStep === (currentProcedure?.steps.length || 0) - 1;
  const allRequiredStepsCompleted = currentProcedure?.steps
    .filter(step => step.required)
    .every(step => completedSteps.has(step.id)) || false;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-4 relative overflow-hidden">
        {/* Confetti effect on completion */}
        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <ReactConfetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
              tweenDuration={10000}
            />
          </div>
        )}
      
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProcedure(null)}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Procedures
            </Button>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentProcedure?.title}</h1>
                <p className="text-gray-600">{currentProcedure?.description}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge variant="outline" className="text-sm bg-blue-50">
                  Step {currentStep + 1} of {currentProcedure?.steps.length}
                </Badge>
              </motion.div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('progress')}</span>
                <motion.div
                  key={getProgressPercentage()}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CountUp 
                    end={getProgressPercentage()} 
                    duration={1}
                    suffix="%" 
                    className="font-medium text-blue-600"
                  />
                </motion.div>
              </div>
              <div className="relative">
                <Progress value={getProgressPercentage()} className="h-3 rounded-full" />
                <motion.div 
                  className="absolute top-0 h-3 rounded-full bg-blue-300 opacity-50"
                  initial={{ width: '0%' }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ 
                opacity: 0, 
                x: animationDirection === 'right' ? 50 : -50 
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ 
                opacity: 0, 
                x: animationDirection === 'right' ? -50 : 50 
              }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {currentStepData && (
                <Card className="mb-6 border-2 shadow-lg">
                  {showTooltip && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white py-2 px-4 rounded-full shadow-lg text-sm"
                    >
                      {currentStep === 0 ? "Let's get started!" : "Continue with the next step"}
                    </motion.div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: completedSteps.has(currentStepData.id) ? 10 : 0 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            completedSteps.has(currentStepData.id) 
                              ? 'bg-green-100 text-green-600 border-2 border-green-400' 
                              : 'bg-blue-100 text-blue-600 border-2 border-blue-400'
                          }`}
                        >
                          {completedSteps.has(currentStepData.id) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{currentStep + 1}</span>
                          )}
                        </motion.div>
                        <div>
                          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {currentStepData.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-xs text-gray-500 cursor-help">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{timeLeft !== null ? timeLeft : currentStepData.estimatedTime}s</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Estimated time remaining for this step</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{currentStepData.description}</p>
                    
                    {currentStepData.safetyNote && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-800">Safety Note</p>
                          <p className="text-sm text-orange-700">{currentStepData.safetyNote}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Step Completion */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <Checkbox
                        id={`step-${currentStepData.id}`}
                        checked={completedSteps.has(currentStepData.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleStepComplete(currentStepData.id);
                          } else {
                            handleStepIncomplete(currentStepData.id);
                          }
                        }}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={`step-${currentStepData.id}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Mark step as completed
                      </label>
                    </motion.div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="h-12 px-6 border-2"
                >
                  <motion.div
                    whileHover={{ x: -3 }}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('previous')}
                  </motion.div>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to previous step</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleRepeat}
                    className="h-12 px-4 border-2"
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start over</p>
              </TooltipContent>
            </Tooltip>

            {isLastStep && allRequiredStepsCompleted ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleComplete}
                      className="h-12 px-6 bg-green-600 hover:bg-green-700 shadow-lg"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Complete
                      </motion.div>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete and submit the procedure</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleNext}
                      disabled={isLastStep}
                      className="h-12 px-6 shadow-md"
                    >
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="flex items-center"
                      >
                        {t('next')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </motion.div>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Continue to the next step</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </motion.div>

        {/* Step List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mt-6 shadow-md">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                All Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-auto p-3">
              {currentProcedure?.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-md' 
                      : completedSteps.has(step.id)
                      ? 'bg-green-50 border border-green-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => {
                    setCurrentStep(index);
                    setAnimationDirection(index < currentStep ? 'left' : 'right');
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: completedSteps.has(step.id) ? 10 : 0 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      completedSteps.has(step.id)
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      index === currentStep 
                        ? 'text-blue-900' 
                        : completedSteps.has(step.id)
                        ? 'text-green-900'
                        : 'text-gray-900'
                    }`}>{step.title}</p>
                    <div className="flex items-center space-x-2">
                      {step.required && (
                        <Badge variant={index === currentStep ? "default" : "outline"} className="text-xs">
                          Required
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{step.estimatedTime}s</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </TooltipProvider>
  );
}