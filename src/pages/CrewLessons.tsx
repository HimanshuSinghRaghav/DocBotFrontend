import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Play, Clock, CheckCircle, Lock } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  completed: boolean;
  locked: boolean;
  category: string;
}

const CrewLessons: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Food Safety Fundamentals',
      description: 'Learn essential food safety protocols and hygiene practices',
      duration: '15 min',
      progress: 85,
      completed: false,
      locked: false,
      category: 'safety'
    },
    {
      id: 2,
      title: 'Customer Service Excellence',
      description: 'Master the art of delivering exceptional customer experiences',
      duration: '20 min',
      progress: 100,
      completed: true,
      locked: false,
      category: 'service'
    },
    {
      id: 3,
      title: 'Menu Knowledge & Recommendations',
      description: 'Comprehensive understanding of our menu items and pairing suggestions',
      duration: '25 min',
      progress: 45,
      completed: false,
      locked: false,
      category: 'knowledge'
    },
    {
      id: 4,
      title: 'POS System Mastery',
      description: 'Operating the point-of-sale system efficiently and accurately',
      duration: '18 min',
      progress: 0,
      completed: false,
      locked: false,
      category: 'systems'
    },
    {
      id: 5,
      title: 'Emergency Procedures',
      description: 'Know what to do in case of emergencies or incidents',
      duration: '12 min',
      progress: 0,
      completed: false,
      locked: true,
      category: 'safety'
    },
    {
      id: 6,
      title: 'Team Communication',
      description: 'Effective communication strategies for team collaboration',
      duration: '16 min',
      progress: 0,
      completed: false,
      locked: false,
      category: 'communication'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Lessons', color: 'bg-gray-500' },
    { id: 'safety', name: 'Safety', color: 'bg-red-500' },
    { id: 'service', name: 'Service', color: 'bg-blue-500' },
    { id: 'knowledge', name: 'Knowledge', color: 'bg-green-500' },
    { id: 'systems', name: 'Systems', color: 'bg-purple-500' },
    { id: 'communication', name: 'Communication', color: 'bg-orange-500' }
  ];

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const handleBack = () => {
    navigate('/crew');
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.locked) {
      return; // Don't navigate if locked
    }
    // Navigate to lesson content
    navigate(`/crew/lesson/${lesson.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Training Lessons</h1>
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

      {/* Lessons Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <Card 
            key={lesson.id} 
            className={`group hover:shadow-2xl transition-all duration-300 cursor-pointer ${
              lesson.locked ? 'opacity-60' : 'hover:scale-105'
            } bg-white border-0 shadow-lg`}
            onClick={() => handleLessonClick(lesson)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  variant={lesson.completed ? "default" : lesson.locked ? "secondary" : "outline"}
                  className={`${
                    lesson.completed ? 'bg-green-100 text-green-800' :
                    lesson.locked ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {lesson.completed ? 'Completed' : lesson.locked ? 'Locked' : 'Available'}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.duration}
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {lesson.description}
              </p>
              
              {!lesson.locked && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{lesson.progress}%</span>
                  </div>
                  <Progress value={lesson.progress} className="h-2" />
                  
                  <Button 
                    className="w-full"
                    variant={lesson.completed ? "outline" : "default"}
                    disabled={lesson.locked}
                  >
                    {lesson.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review
                      </>
                    ) : lesson.progress > 0 ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {lesson.locked && (
                <div className="text-center py-4">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Complete previous lessons to unlock
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {lessons.length}
                </div>
                <div className="text-gray-600">Total Lessons</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {lessons.filter(l => l.completed).length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {lessons.filter(l => !l.completed && !l.locked).length}
                </div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {Math.round(lessons.filter(l => l.completed).length / lessons.length * 100)}%
                </div>
                <div className="text-gray-600">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrewLessons;
