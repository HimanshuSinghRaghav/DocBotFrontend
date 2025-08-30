import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Play, Trophy, Clock, Target, Award } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: number;
  timeLimit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  bestScore?: number;
  attempts: number;
  completed: boolean;
}

const CrewQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quizzes: Quiz[] = [
    {
      id: 1,
      title: 'Food Safety Basics',
      description: 'Test your knowledge of essential food safety protocols',
      questions: 15,
      timeLimit: '20 min',
      difficulty: 'easy',
      category: 'safety',
      bestScore: 85,
      attempts: 2,
      completed: true
    },
    {
      id: 2,
      title: 'Customer Service Mastery',
      description: 'Evaluate your customer service skills and knowledge',
      questions: 20,
      timeLimit: '25 min',
      difficulty: 'medium',
      category: 'service',
      bestScore: 92,
      attempts: 1,
      completed: true
    },
    {
      id: 3,
      title: 'Menu Knowledge Challenge',
      description: 'Test your understanding of menu items and ingredients',
      questions: 18,
      timeLimit: '22 min',
      difficulty: 'medium',
      category: 'knowledge',
      bestScore: 78,
      attempts: 3,
      completed: true
    },
    {
      id: 4,
      title: 'POS System Proficiency',
      description: 'Assess your point-of-sale system operation skills',
      questions: 12,
      timeLimit: '15 min',
      difficulty: 'easy',
      category: 'systems',
      attempts: 0,
      completed: false
    },
    {
      id: 5,
      title: 'Emergency Procedures',
      description: 'Test your knowledge of emergency protocols',
      questions: 10,
      timeLimit: '12 min',
      difficulty: 'hard',
      category: 'safety',
      attempts: 0,
      completed: false
    },
    {
      id: 6,
      title: 'Team Communication',
      description: 'Evaluate your communication and teamwork skills',
      questions: 16,
      timeLimit: '18 min',
      difficulty: 'medium',
      category: 'communication',
      attempts: 0,
      completed: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Quizzes', color: 'bg-gray-500' },
    { id: 'safety', name: 'Safety', color: 'bg-red-500' },
    { id: 'service', name: 'Service', color: 'bg-blue-500' },
    { id: 'knowledge', name: 'Knowledge', color: 'bg-green-500' },
    { id: 'systems', name: 'Systems', color: 'bg-purple-500' },
    { id: 'communication', name: 'Communication', color: 'bg-orange-500' }
  ];

  const filteredQuizzes = selectedCategory === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const handleBack = () => {
    navigate('/crew');
  };

  const handleQuizStart = (quiz: Quiz) => {
    navigate(`/crew/quiz/${quiz.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Quizzes</h1>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id 
                  ? category.color 
                  : 'hover:bg-white hover:shadow-md'
              } transition-all duration-200`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card 
            key={quiz.id} 
            className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  variant={quiz.completed ? "default" : "outline"}
                  className={`${
                    quiz.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {quiz.completed ? 'Completed' : 'Available'}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {quiz.timeLimit}
                </div>
              </div>
              
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                {quiz.title}
              </CardTitle>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className={getDifficultyColor(quiz.difficulty)}>
                  {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  {quiz.questions} questions
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {quiz.description}
              </p>
              
              {quiz.completed && quiz.bestScore && (
                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Best Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {quiz.bestScore}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={quiz.bestScore} className="h-2" />
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full"
                variant={quiz.completed ? "outline" : "default"}
                onClick={() => handleQuizStart(quiz)}
              >
                {quiz.completed ? (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              Your Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {quizzes.length}
                </div>
                <div className="text-gray-600">Total Quizzes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {quizzes.filter(q => q.completed).length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {quizzes.filter(q => q.completed && q.bestScore).reduce((acc, q) => acc + (q.bestScore || 0), 0) / Math.max(quizzes.filter(q => q.completed && q.bestScore).length, 1)}%
                </div>
                <div className="text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {quizzes.reduce((acc, q) => acc + q.attempts, 0)}
                </div>
                <div className="text-gray-600">Total Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-2">Quiz Tips</h3>
              <p className="text-blue-100">
                Read questions carefully, manage your time wisely, and review your answers before submitting. 
                You can retake quizzes to improve your score!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrewQuiz;
