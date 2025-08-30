import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Play, Trophy, Clock, Target, Award, Loader2, Brain, CheckCircle, Star } from 'lucide-react';
import { quizApi, QuizResponse } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Quiz {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  estimated_duration: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  category: string;
  best_score?: number;
  attempts: number;
  completed: boolean;
  passing_score: number;
  time_limit?: number;
}

const CrewQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    if (containerRef.current) {
      tl.from(containerRef.current.children, {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }, []);

  // Load quiz data
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading quiz data...');
        
        // Use hardcoded quiz data directly
        const hardcodedQuizzes = getHardcodedQuizzes();
        setQuizzes(hardcodedQuizzes);
        
        toast.success(`${hardcodedQuizzes.length} quizzes loaded successfully!`);
        setError(null);
      } catch (error) {
        console.error('Error loading quizzes:', error);
        setError('Failed to load quizzes. Please try again.');
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Hardcoded quiz data
  const getHardcodedQuizzes = (): Quiz[] => [
    {
      id: 'food-safety-basics',
      title: 'Food Safety Fundamentals',
      description: 'Master the essential principles of food safety, hygiene protocols, and contamination prevention in restaurant environments',
      total_questions: 15,
      estimated_duration: 20,
      difficulty_level: 'Easy',
      category: 'safety',
      best_score: 85,
      attempts: 2,
      completed: true,
      passing_score: 70,
      time_limit: 20
    },
    {
     id: 'customer-service',
      title: 'Customer Service Excellence',
      description: 'Enhance your customer interaction skills and service quality standards to create exceptional dining experiences',
      total_questions: 20,
      estimated_duration: 25,
      difficulty_level: 'Medium',
      category: 'service',
      best_score: 92,
      attempts: 1,
      completed: true,
      passing_score: 75,
      time_limit: 25
    },
    {
       id: 'menu-knowledge',
      title: 'Menu Knowledge Advanced',
      description: 'Comprehensive understanding of ingredients, allergens, and preparation methods for all menu items',
      total_questions: 25,
      estimated_duration: 30,
      difficulty_level: 'Hard',
      category: 'knowledge',
      best_score: undefined,
      attempts: 0,
      completed: false,
      passing_score: 80,
      time_limit: 30
    },
    {
     id: 'pos-systems',
      title: 'POS System Operations',
      description: 'Master the point-of-sale system and payment processing procedures for efficient order management',
      total_questions: 12,
      estimated_duration: 15,
      difficulty_level: 'Easy',
      category: 'systems',
      best_score: 78,
      attempts: 3,
      completed: true,
      passing_score: 70,
      time_limit: 15
    },
    
    {
       id: 'emergency-procedures',
      title: 'Emergency Procedures',
      description: 'Critical safety protocols for handling emergencies and unexpected situations in the restaurant environment',
      total_questions: 10,
      estimated_duration: 12,
      difficulty_level: 'Medium',
      category: 'safety',
      best_score: 95,
      attempts: 1,
      completed: true,
      passing_score: 85,
      time_limit: 12
    },
    
   
    
  
  ];
  const categories = [
    { id: 'all', name: 'All Quizzes', color: 'from-gray-500 to-gray-600', textColor: 'text-white' },
    { id: 'safety', name: 'Safety', color: 'from-red-500 to-red-600', textColor: 'text-white' },
    { id: 'service', name: 'Service', color: 'from-blue-500 to-blue-600', textColor: 'text-white' },
    { id: 'knowledge', name: 'Knowledge', color: 'from-green-500 to-green-600', textColor: 'text-white' },
    { id: 'systems', name: 'Systems', color: 'from-purple-500 to-purple-600', textColor: 'text-white' },
    { id: 'communication', name: 'Communication', color: 'from-orange-500 to-orange-600', textColor: 'text-white' }
  ];
    const { user } = useAuth();

  const filteredQuizzes = selectedCategory === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const handleQuizStart = (quiz: Quiz) => {
    if (user?.role == "admin") {
      navigate(`/admin/quiz/${quiz.id}`);
     }else{

       navigate(`/crew/quiz/${quiz.id}`);
     }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
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
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Loading Quizzes...</h2>
            <p className="text-gray-600 text-center">Fetching quiz data from server...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error && quizzes.length === 0) {
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
            <h2 className="text-xl font-semibold text-gray-800">Failed to Load Quizzes</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

    const handleBack = () => {
      toast.success('Returning to dashboard...');
        if(user?.role === 'admin'){
  
                        navigate('/admin')
  }else{
  
    navigate('/crew');
  }
    };
  

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
    >
      {/* Header with Back Button */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={handleBack}
            className="bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </motion.div>

      {/* Header Section */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Quizzes</h1>
              <p className="text-gray-600">Test your knowledge and track your progress</p>
            </div>
          </motion.div>
          
          {/* Interactive Stats */}
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="text-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(168, 85, 247, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-2xl font-bold text-purple-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                {quizzes.length}
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">Available</div>
            </motion.div>
            
            <motion.div 
              className="text-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-2xl font-bold text-green-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {quizzes.filter(q => q.completed).length}
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">Completed</div>
            </motion.div>
            
            <motion.div 
              className="text-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="text-2xl font-bold text-blue-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {quizzes.filter(q => q.best_score).length > 0 
                  ? Math.round(quizzes.filter(q => q.best_score).reduce((acc, q) => acc + (q.best_score || 0), 0) / quizzes.filter(q => q.best_score).length) 
                  : 0}%
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">Avg Score</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} ${category.textColor} shadow-lg` 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {category.id === 'all' ? quizzes.length : quizzes.filter(q => q.category === category.id).length}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quizzes Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
      >
        <AnimatePresence>
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => handleQuizStart(quiz)}
            >
              <Card className="relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  quiz.completed 
                    ? 'from-green-50 to-emerald-50' 
                    : 'from-purple-50 to-blue-50'
                } opacity-60 -z-10`} />
                
                {/* Hover Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none -z-10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Badge 
                        className={`${
                          quiz.completed 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        } px-4 py-2 rounded-full font-semibold`}
                      >
                        {quiz.completed ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Available</span>
                          </div>
                        )}
                      </Badge>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {quiz.estimated_duration} min
                    </motion.div>
                  </div>
                  
                  <CardTitle className={`text-2xl font-bold mb-3 transition-colors ${
                    quiz.completed 
                      ? 'text-green-700 group-hover:text-green-600'
                      : 'text-gray-800 group-hover:text-purple-600'
                  }`}>
                    {quiz.title}
                  </CardTitle>
                  
                  {/* Difficulty and Questions */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(quiz.difficulty_level)} px-3 py-1 rounded-full font-medium shadow-sm`}
                    >
                      {getDifficultyIcon(quiz.difficulty_level)} {quiz.difficulty_level}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="bg-white/80 text-gray-700 border-gray-300 px-3 py-1 rounded-full"
                    >
                      {quiz.total_questions} questions
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                    {quiz.description}
                  </p>
                  
                  {/* Passing Score Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Passing Score: {quiz.passing_score}%</span>
                    </div>
                  </div>
                  
                  {quiz.completed && quiz.best_score && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Best Score</span>
                        </div>
                        <motion.div 
                          className="text-2xl font-bold text-green-600"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {quiz.best_score}%
                        </motion.div>
                      </div>
                      <div className="mt-2">
                        <Progress value={quiz.best_score} className="h-2" />
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                        quiz.completed 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg'
                      }`}
                      onClick={() => handleQuizStart(quiz)}
                    >
                      {quiz.completed ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Retake Quiz</span>
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>Start Quiz</span>
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Performance Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white border-0 shadow-2xl overflow-hidden relative">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20 -z-10">
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)'
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <CardContent className="p-8 relative z-10">
            <motion.div 
              className="text-center mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="h-16 w-16 mx-auto mb-6 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4">Your Quiz Performance</h2>
              <motion.p 
                className="text-purple-100 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Track your knowledge growth and celebrate achievements!
              </motion.p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Total Quizzes', 
                  value: quizzes.length.toString(), 
                  icon: Brain,
                  description: 'Available quizzes'
                },
                { 
                  label: 'Completed', 
                  value: quizzes.filter(q => q.completed).length.toString(), 
                  icon: CheckCircle,
                  description: 'Successfully finished'
                },
                { 
                  label: 'Average Score', 
                  value: quizzes.filter(q => q.best_score).length > 0 
                    ? `${Math.round(quizzes.filter(q => q.best_score).reduce((acc, q) => acc + (q.best_score || 0), 0) / quizzes.filter(q => q.best_score).length)}%`
                    : '0%', 
                  icon: Trophy,
                  description: 'Your performance'
                },
                { 
                  label: 'Total Attempts', 
                  value: quizzes.reduce((acc, q) => acc + q.attempts, 0).toString(), 
                  icon: Target,
                  description: 'Quiz attempts'
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <IconComponent className="h-12 w-12 mx-auto mb-4 text-white" />
                    </motion.div>
                    <motion.div 
                      className="text-4xl font-bold text-white mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-lg font-semibold text-white mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-purple-100">
                      {stat.description}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Target className="h-12 w-12 mx-auto mb-4 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Quiz Tips for Success</h3>
              <p className="text-blue-100">
                📚 Read questions carefully • ⏱️ Manage your time wisely • 🔄 Review before submitting • 🏆 Retake to improve scores!
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CrewQuiz;
