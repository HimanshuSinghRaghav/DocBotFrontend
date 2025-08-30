import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Brain, MessageCircle, ArrowLeft, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CrewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/dashboard');
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
                Back
              </Button>
              <div className="h-4 w-px bg-border"></div>
              <h1 className="text-lg font-medium text-foreground">Training Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.name || user?.email || 'User'}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-border/50 hover:bg-muted/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="minimal-container minimal-section">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-foreground mb-4">
            Welcome to Your Training Portal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose what you'd like to do today. Take a lesson, test your knowledge, or ask questions.
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="minimal-grid grid-cols-1 md:grid-cols-3 mb-16">
          {/* Take a Lesson Card */}
          <Card className="minimal-card hover:shadow-md transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Take a Lesson
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-8">
              <p className="text-muted-foreground mb-6">
                Learn new skills and procedures through interactive lessons
              </p>
              <Button 
                className="w-full minimal-button"
                onClick={() => navigate('/crew/lessons')}
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>

          {/* Take Quiz Card */}
          <Card className="minimal-card hover:shadow-md transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Take Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-8">
              <p className="text-muted-foreground mb-6">
                Test your knowledge and track your progress
              </p>
              <Button 
                className="w-full minimal-button"
                onClick={() => navigate('/crew/quiz')}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>

          {/* Ask Bot Card */}
          <Card className="minimal-card hover:shadow-md transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Ask Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-8">
              <p className="text-muted-foreground mb-6">
                Get instant answers to your questions from our AI assistant
              </p>
              <Button 
                className="w-full minimal-button"
                onClick={() => navigate('/crew/chat')}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

       
      </div>
    </div>
  );
};

export default CrewDashboard;