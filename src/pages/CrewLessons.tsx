import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Play, Clock, CheckCircle, Lock, BookOpen, GraduationCap, Star, Loader2, ArrowLeft } from 'lucide-react';
import { lessonsApi, LessonResponse } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  completed: boolean;
  locked: boolean;
  category: string;
  document_id: string;
  module_order: number;
  estimated_duration: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CrewLessons: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

  // Fetch lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await lessonsApi.getLessons();
        
        // Transform API response to match our Lesson interface
        const transformedLessons: Lesson[] = response.map((lesson: LessonResponse, index: number) => ({
          id: lesson.document_id || `lesson-${index}`,
          title: lesson.title,
          description: lesson.description,
          duration: `${lesson.estimated_duration} min`,
          progress: lesson.progress || 0,
          completed: lesson.completed || false,
          locked: lesson.locked || (index > 2), // Lock lessons after the first 3
          category: lesson.category || getCategoryFromDifficulty(lesson.difficulty_level),
          document_id: lesson.document_id,
          module_order: lesson.module_order,
          estimated_duration: lesson.estimated_duration,
          difficulty_level: lesson.difficulty_level
        }));
        
        // Sort by module_order
        transformedLessons.sort((a, b) => a.module_order - b.module_order);
        
        setLessons(transformedLessons);
        toast.success(`${transformedLessons.length} lessons loaded successfully!`);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to load lessons. Please try again.');
        toast.error('Failed to load lessons');
        
        // Fallback to mock data if API fails
        setLessons(getFallbackLessons());
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Helper function to map difficulty to category
  const getCategoryFromDifficulty = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'safety';
      case 'intermediate':
        return 'knowledge';
      case 'advanced':
        return 'systems';
      default:
        return 'general';
    }
  };

  // Fallback lessons in case API fails
  const getFallbackLessons = (): Lesson[] => [
    {
      id: 'fallback-1',
      title: 'Food Safety Fundamentals',
      description: 'Learn essential food safety protocols and hygiene practices',
      duration: '15 min',
      progress: 85,
      completed: false,
      locked: false,
      category: 'safety',
      document_id: 'foodsafety.pdf',
      module_order: 1,
      estimated_duration: 15,
      difficulty_level: 'Beginner'
    },
    {
      id: 'fallback-2',
      title: 'Customer Service Excellence',
      description: 'Master the art of delivering exceptional customer experiences',
      duration: '20 min',
      progress: 100,
      completed: true,
      locked: false,
      category: 'service',
      document_id: 'service.pdf',
      module_order: 2,
      estimated_duration: 20,
      difficulty_level: 'Intermediate'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Lessons', color: 'from-gray-500 to-gray-600', textColor: 'text-white' },
    { id: 'safety', name: 'Safety', color: 'from-red-500 to-red-600', textColor: 'text-white' },
    { id: 'service', name: 'Service', color: 'from-blue-500 to-blue-600', textColor: 'text-white' },
    { id: 'knowledge', name: 'Knowledge', color: 'from-green-500 to-green-600', textColor: 'text-white' },
    { id: 'systems', name: 'Systems', color: 'from-purple-500 to-purple-600', textColor: 'text-white' },
    { id: 'communication', name: 'Communication', color: 'from-orange-500 to-orange-600', textColor: 'text-white' },
    { id: 'general', name: 'General', color: 'from-indigo-500 to-indigo-600', textColor: 'text-white' }
  ];

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const { user } = useAuth();
    const handleLessonClick = (lesson: Lesson) => {
    if (lesson.locked) {
      toast.error('This lesson is locked. Complete previous lessons to unlock.');
      return;
    }
    // Navigate to lesson content
if(user?.role === 'admin'){

  navigate(`/admin/lesson/${lesson.id}`);
}else{

  navigate(`/admin/lesson/${lesson.id}`);
}
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Loading Lessons...</h2>
            <p className="text-gray-600 text-center">Please wait while we fetch your training modules</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Failed to Load Lessons</h2>
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
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6"
    >
      {/* Back Button and Header Integration */}
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
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
              <p className="text-gray-600">Enhance your skills with interactive lessons</p>
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
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory('all');
                toast.info(`Showing all ${lessons.length} available lessons`);
              }}
            >
              <motion.div 
                className="text-2xl font-bold text-blue-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                {lessons.length}
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">Available</div>
            </motion.div>
            
            <motion.div 
              className="text-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const completed = lessons.filter(l => l.completed);
                if (completed.length > 0) {
                  toast.success(`🎉 You've completed ${completed.length} lessons! Great job!`);
                } else {
                  toast.info('Start your first lesson to see completed progress here!');
                }
              }}
            >
              <motion.div 
                className="text-2xl font-bold text-green-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {lessons.filter(l => l.completed).length}
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">Completed</div>
            </motion.div>
            
            <motion.div 
              className="text-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.1)', y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const inProgress = lessons.filter(l => l.progress > 0 && !l.completed);
                if (inProgress.length > 0) {
                  toast.info(`Continue with your ${inProgress.length} lessons in progress!`);
                } else {
                  toast.info('Start a new lesson to track your progress!');
                }
              }}
            >
              <motion.div 
                className="text-2xl font-bold text-orange-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {lessons.filter(l => l.progress > 0 && !l.completed).length}
              </motion.div>
              <div className="text-xs text-gray-600 font-medium">In Progress</div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Progress Overview Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full bg-gray-200 rounded-full h-3 mb-4 cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ 
              width: lessons.length > 0 ? `${(lessons.filter(l => l.completed).length / lessons.length) * 100}%` : '0%' 
            }}
            transition={{ delay: 0.6, duration: 1 }}
            whileHover={{ 
              backgroundImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #3b82f6)',
              backgroundSize: '200% 100%',
              animation: 'gradient 2s ease infinite'
            }}
          >
            <motion.div 
              className="absolute -top-8 right-0 text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded-lg shadow-sm"
              whileHover={{ scale: 1.1 }}
            >
              {lessons.length > 0 ? Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100) : 0}% Complete
            </motion.div>
          </motion.div>
          
          {/* Animated sparkles on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            whileHover={{
              background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto mb-12"
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
                    {category.id === 'all' ? lessons.length : lessons.filter(l => l.category === category.id).length}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <motion.div 
        ref={cardsRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
      >
        <AnimatePresence>
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={!lesson.locked ? { 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              } : {}}
              whileTap={!lesson.locked ? { scale: 0.98 } : {}}
              className={`group cursor-pointer ${lesson.locked ? 'opacity-70' : ''}`}
              onClick={() => handleLessonClick(lesson)}
            >
              <Card className="relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                {/* Progress Ring Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  lesson.completed 
                    ? 'from-green-50 to-emerald-50' 
                    : lesson.locked 
                      ? 'from-gray-50 to-gray-100'
                      : 'from-blue-50 to-green-50'
                } opacity-60 -z-10`} />
                
                {/* Hover Shine Effect */}
                {!lesson.locked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none -z-10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={!lesson.locked ? { scale: 1.1 } : {}}
                    >
                      <Badge 
                        className={`${
                          lesson.completed 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                            : lesson.locked 
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                        } px-4 py-2 rounded-full font-semibold`}
                      >
                        {lesson.completed ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        ) : lesson.locked ? (
                          <div className="flex items-center space-x-1">
                            <Lock className="h-3 w-3" />
                            <span>Locked</span>
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
                      whileHover={!lesson.locked ? { scale: 1.05 } : {}}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration}
                    </motion.div>
                  </div>
                  
                  <CardTitle className={`text-2xl font-bold mb-3 transition-colors ${
                    lesson.locked 
                      ? 'text-gray-500' 
                      : lesson.completed 
                        ? 'text-green-700 group-hover:text-green-600'
                        : 'text-gray-800 group-hover:text-blue-600'
                  }`}>
                    {lesson.title}
                  </CardTitle>
                  
                  {/* Difficulty and Module Order */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(lesson.difficulty_level)} px-3 py-1 rounded-full font-medium shadow-sm`}
                    >
                      {getDifficultyIcon(lesson.difficulty_level)} {lesson.difficulty_level}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="bg-white/80 text-gray-700 border-gray-300 px-3 py-1 rounded-full"
                    >
                      Module {lesson.module_order}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className={`mb-6 text-sm leading-relaxed ${
                    lesson.locked ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {lesson.description}
                  </p>
                  
                  {/* Document Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">Source: {lesson.document_id}</span>
                    </div>
                  </div>
                  
                  {!lesson.locked ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Progress</span>
                        <motion.span 
                          className="font-bold text-gray-800"
                          animate={{ scale: lesson.progress > 0 ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 1, repeat: lesson.progress > 0 ? Infinity : 0, repeatDelay: 2 }}
                        >
                          {lesson.progress}%
                        </motion.span>
                      </div>
                      
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      >
                        <Progress value={lesson.progress} className="h-3 rounded-full" />
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                            lesson.completed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg'
                          }`}
                          disabled={lesson.locked}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          {lesson.completed ? (
                            <div className="flex items-center justify-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Review</span>
                            </div>
                          ) : lesson.progress > 0 ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Play className="h-4 w-4" />
                              <span>Continue</span>
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
                              <span>Start</span>
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
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-8"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-sm text-gray-500 font-medium">
                        Complete previous lessons to unlock
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Learning Progress Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="bg-gradient-to-r from-emerald-600 via-blue-600 to-green-600 text-white border-0 shadow-2xl overflow-hidden relative">
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
                <GraduationCap className="h-16 w-16 mx-auto mb-6 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4">Your Learning Journey</h2>
              <motion.p 
                className="text-green-100 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Keep up the great work! Every lesson completed brings you closer to mastery.
              </motion.p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Lessons Available', 
                  value: lessons.length.toString(), 
                  icon: BookOpen,
                  description: 'Total learning modules'
                },
                { 
                  label: 'Completed', 
                  value: lessons.filter(l => l.completed).length.toString(), 
                  icon: CheckCircle,
                  description: 'Successfully finished'
                },
                { 
                  label: 'In Progress', 
                  value: lessons.filter(l => l.progress > 0 && !l.completed).length.toString(), 
                  icon: Play,
                  description: 'Currently learning'
                },
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
                    <div className="text-sm text-green-100">
                      {stat.description}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CrewLessons;
