import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  Play, 
  BookOpen, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  FileText,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { lessonsApi } from '../lib/api';
import { useAuth } from '@/contexts/AuthContext';

// API Response interface for the new lesson structure
interface ApiLessonResponse {
  id: number;
  title: string;
  description: string;
  document_id: number;
  module_order: number;
  estimated_duration: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  learning_objectives: string[];
  prerequisites: string[];
  category: string;
  module_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  sessions_count: number;
  steps?: Array<{
    step_number: number;
    step_description: string;
  }>;
}

interface LessonStep {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'content' | 'activity' | 'quiz' | 'summary';
  duration: number; // in minutes
  completed: boolean;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  document_id: number;
  module_order: number;
  estimated_duration: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  learning_objectives: string[];
  prerequisites: string[];
  category: string;
  sessions_count: number;
  created_at: string;
  updated_at: string | null;
  module_metadata: Record<string, unknown> | null;
  steps: LessonStep[];
  progress: number;
  completed: boolean;
}

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

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

  // Step transition animation
  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, 
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [currentStepIndex]);

  // Fetch lesson details
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching lesson with ID: ${lessonId}`);
        
        // Try to fetch from API first
        const apiResponse = await lessonsApi.getLessonById(lessonId);
        console.log('API Response:', apiResponse);
        
        if (apiResponse) {
          const transformedLesson = transformApiResponseToLesson(apiResponse, lessonId);
          setLesson(transformedLesson);
          
          // Set current step based on progress
          const completedSteps = Math.floor((transformedLesson.progress / 100) * transformedLesson.steps.length);
          setCurrentStepIndex(Math.min(completedSteps, transformedLesson.steps.length - 1));
          
          toast.success('Lesson loaded from API successfully!');
        } else {
          throw new Error('No lesson data received from API');
        }
      } catch (error) {
        console.error('Error fetching lesson from API:', error);
        console.log('Falling back to mock data...');
        
        // Fallback to mock data if API fails
        try {
          const mockLesson = createMockLesson(lessonId);
          setLesson(mockLesson);
          
          // Set current step based on progress
          const completedSteps = Math.floor((mockLesson.progress / 100) * mockLesson.steps.length);
          setCurrentStepIndex(Math.min(completedSteps, mockLesson.steps.length - 1));
          
        //   toast.warning('API unavailable - using demo content. Some features may be limited.');
        } catch (fallbackError) {
          console.error('Error creating fallback lesson:', fallbackError);
          setError('Failed to load lesson. Please try again.');
          toast.error('Failed to load lesson');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Transform API response to lesson format
  const transformApiResponseToLesson = (apiResponse: ApiLessonResponse, id: string): LessonDetail => {
    // Create steps based on learning objectives if no steps are provided
    const createStepsFromObjectives = (objectives: string[]): LessonStep[] => {
      const steps: LessonStep[] = [];
      
      // Introduction step
      steps.push({
        id: 'intro',
        title: `Welcome to ${apiResponse.title}`,
        content: formatIntroContent(apiResponse),
        type: 'introduction',
        duration: 5,
        completed: false
      });

      // Create content steps from learning objectives
      objectives.forEach((objective, index) => {
        const cleanObjective = objective.replace(/\*\*/g, '').replace(/\[\d+\]/g, '').trim();
        steps.push({
          id: `objective-${index + 1}`,
          title: `Learning Objective ${index + 1}`,
          content: formatObjectiveContent(cleanObjective, objective, apiResponse),
          type: 'content',
          duration: Math.ceil((apiResponse.estimated_duration - 5) / objectives.length),
          completed: false
        });
      });

      // Summary step
      steps.push({
        id: 'summary',
        title: 'Lesson Summary',
        content: formatSummaryContent(apiResponse),
        type: 'summary',
        duration: 3,
        completed: false
      });

      return steps;
    };

    // Use existing steps if available, otherwise create from objectives
    const transformedSteps: LessonStep[] = apiResponse.steps && apiResponse.steps.length > 0
      ? apiResponse.steps.map((step, index: number): LessonStep => {
          const stepType: 'introduction' | 'content' | 'activity' | 'quiz' | 'summary' = 
            index === 0 ? 'introduction' : 
            index === apiResponse.steps!.length - 1 ? 'summary' : 
            'content';
          
          return {
            id: `step-${step.step_number}`,
            title: `Step ${step.step_number}: ${extractStepTitle(step.step_description)}`,
            content: formatStepContent(step.step_description, apiResponse, index),
            type: stepType,
            duration: Math.ceil(apiResponse.estimated_duration / apiResponse.steps!.length),
            completed: false
          };
        })
      : createStepsFromObjectives(apiResponse.learning_objectives || []);

    return {
      id: id,
      title: apiResponse.title,
      description: apiResponse.description,
      document_id: apiResponse.document_id,
      module_order: apiResponse.module_order,
      estimated_duration: apiResponse.estimated_duration,
      difficulty_level: apiResponse.difficulty_level,
      learning_objectives: apiResponse.learning_objectives || [],
      prerequisites: apiResponse.prerequisites || [],
      category: apiResponse.category || getCategoryFromDifficulty(apiResponse.difficulty_level),
      sessions_count: apiResponse.sessions_count || 1,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
      module_metadata: apiResponse.module_metadata,
      steps: transformedSteps,
      progress: 0,
      completed: false
    };
  };

  // Helper function to extract step title from description
  const extractStepTitle = (description: string): string => {
    // Extract text before the first colon or use first 50 characters
    const firstSentence = description.split(':')[0] || description.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence;
  };

  // Helper function to format step content
  const formatStepContent = (description: string, apiResponse: ApiLessonResponse, stepIndex: number): string => {
    let content = `# ${extractStepTitle(description)}\n\n${description}\n\n`;
    
    // Add learning objectives for introduction step
    if (stepIndex === 0 && apiResponse.learning_objectives) {
      content += `## Learning Objectives\n\n`;
      apiResponse.learning_objectives.forEach((objective: string, index: number) => {
        content += `${index + 1}. ${objective}\n`;
      });
      content += '\n';
    }

    // Add prerequisites if available
    if (stepIndex === 0 && apiResponse.prerequisites && apiResponse.prerequisites.length > 0) {
      content += `## Prerequisites\n\n`;
      apiResponse.prerequisites.forEach((prerequisite: string, index: number) => {
        content += `${index + 1}. ${prerequisite}\n`;
      });
      content += '\n';
    }

    return content;
  };

  // Helper function to format objective content
  const formatObjectiveContent = (cleanObjective: string, originalObjective: string, apiResponse: ApiLessonResponse): string => {
    let content = `# ${cleanObjective}\n\n`;
    
    content += `## Overview\n\n`;
    content += `${originalObjective}\n\n`;
    
    content += `## Key Points\n\n`;
    content += `This learning objective focuses on understanding and implementing the key concepts related to:\n\n`;
    content += `- **${cleanObjective}**\n`;
    content += `- Practical application in real-world scenarios\n`;
    content += `- Compliance with regulatory requirements\n`;
    content += `- Best practices and industry standards\n\n`;
    
    content += `## Important Considerations\n\n`;
    content += `As you work through this objective, consider how it relates to your daily responsibilities and the broader context of ${apiResponse.category || 'workplace safety'}.\n\n`;
    
    content += `Take time to understand not just the 'what' but also the 'why' behind each requirement or procedure.`;
    
    return content;
  };

  // Helper function to format summary content
  const formatSummaryContent = (apiResponse: ApiLessonResponse): string => {
    let content = `# Lesson Complete! 🎉\n\n`;
    
    content += `Congratulations on completing **${apiResponse.title}**!\n\n`;
    
    content += `## What You've Learned\n\n`;
    if (apiResponse.learning_objectives && apiResponse.learning_objectives.length > 0) {
      apiResponse.learning_objectives.forEach((objective: string, index: number) => {
        const cleanObjective = objective.replace(/\*\*/g, '').replace(/\[\d+\]/g, '').trim();
        content += `✅ **Objective ${index + 1}**: ${cleanObjective}\n`;
      });
    }
    
    content += `\n## Key Takeaways\n\n`;
    content += `- You have successfully completed Module ${apiResponse.module_order}\n`;
    content += `- Estimated completion time: ${apiResponse.estimated_duration} minutes\n`;
    content += `- Difficulty level: ${apiResponse.difficulty_level}\n`;
    content += `- Total sessions available: ${apiResponse.sessions_count || 1}\n\n`;
    
    content += `## Next Steps\n\n`;
    content += `- Review the key concepts covered in this lesson\n`;
    content += `- Apply what you've learned in your daily work\n`;
    content += `- Consider taking additional related courses\n`;
    content += `- Share your knowledge with colleagues\n\n`;
    
    content += `## Certification Progress\n\n`;
    content += `You have earned points toward your professional development certification!\n\n`;
    content += `Keep up the excellent work in your learning journey!`;
    
    return content;
  };

  // Helper function to format introduction content
  const formatIntroContent = (apiResponse: ApiLessonResponse): string => {
    let content = `# Welcome to ${apiResponse.title}\n\n`;
    content += `${apiResponse.description}\n\n`;
    
    if (apiResponse.learning_objectives && apiResponse.learning_objectives.length > 0) {
      content += `## Learning Objectives\n\nBy the end of this lesson, you will be able to:\n\n`;
      apiResponse.learning_objectives.forEach((objective: string, index: number) => {
        content += `${index + 1}. ${objective}\n`;
      });
      content += '\n';
    }

    if (apiResponse.prerequisites && apiResponse.prerequisites.length > 0) {
      content += `## Prerequisites\n\nBefore starting this lesson, you should have completed:\n\n`;
      apiResponse.prerequisites.forEach((prerequisite: string, index: number) => {
        content += `${index + 1}. ${prerequisite}\n`;
      });
      content += '\n';
    }

    content += `## Lesson Details\n\n`;
    content += `- **Module Order:** ${apiResponse.module_order}\n`;
    content += `- **Estimated Duration:** ${apiResponse.estimated_duration} minutes\n`;
    content += `- **Difficulty Level:** ${apiResponse.difficulty_level}\n`;
    content += `- **Category:** ${apiResponse.category || 'General Training'}\n`;
    content += `- **Available Sessions:** ${apiResponse.sessions_count || 1}\n\n`;
    
    if (apiResponse.created_at) {
      const createdDate = new Date(apiResponse.created_at).toLocaleDateString();
      content += `- **Created:** ${createdDate}\n`;
    }
    
    content += `\n## Ready to Begin?\n\n`;
    content += `This comprehensive lesson will guide you through essential concepts and practical applications. `;
    content += `Take your time to absorb the material and don't hesitate to revisit sections as needed.\n\n`;
    content += `Let's begin your learning journey!`;

    return content;
  };

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
  // Create mock lesson data (fallback)
  const createMockLesson = (id: string): LessonDetail => {
    const mockSteps: LessonStep[] = [
      {
        id: 'intro',
        title: 'Welcome to Food Safety Training',
        content: `
# Introduction to Food Safety

Welcome to this comprehensive food safety training module. In this lesson, you will learn:

- **Basic food safety principles**
- **Temperature control guidelines**
- **Personal hygiene requirements**
- **Cross-contamination prevention**
- **Proper food storage techniques**

## Learning Objectives
By the end of this lesson, you will be able to:
1. Identify potential food safety hazards
2. Apply proper temperature control measures
3. Demonstrate correct handwashing techniques
4. Implement cross-contamination prevention strategies

Let's begin your journey to becoming a food safety expert!
        `,
        type: 'introduction',
        duration: 3,
        completed: false
      },
      {
        id: 'temperature-control',
        title: 'Temperature Control',
        content: `
# Temperature Control Guidelines

## Critical Temperature Zones

### Danger Zone: 40°F - 140°F (4°C - 60°C)
- Bacteria multiply rapidly in this temperature range
- Food should not remain in this zone for more than 2 hours
- In hot weather (90°F+), reduce to 1 hour maximum

### Safe Temperatures:
- **Cold Storage**: Below 40°F (4°C)
- **Hot Holding**: Above 140°F (60°C)
- **Cooking Temperatures**: Vary by food type

## Key Rules:
1. **Keep hot foods hot** - above 140°F
2. **Keep cold foods cold** - below 40°F
3. **Cook to proper internal temperatures**
4. **Cool foods quickly** - from 140°F to 70°F within 2 hours

## Temperature Monitoring:
- Use calibrated thermometers
- Check temperatures regularly
- Document temperature logs
- Take corrective action when needed
        `,
        type: 'content',
        duration: 5,
        completed: false
      },
      {
        id: 'hygiene-activity',
        title: 'Personal Hygiene Practice',
        content: `
# Handwashing Technique

## Interactive Activity: Proper Handwashing

Follow these steps for effective handwashing:

### Step 1: Preparation
- Remove jewelry and watches
- Turn on water to comfortable temperature
- Apply soap to hands

### Step 2: The 20-Second Rule
Scrub all surfaces for at least 20 seconds:
- Palms and back of hands
- Between fingers
- Under fingernails
- Wrists and forearms

### Step 3: Rinse and Dry
- Rinse thoroughly with clean water
- Dry with single-use paper towels
- Use paper towel to turn off faucet

## When to Wash Hands:
- Before starting work
- After using restroom
- After touching face, hair, or body
- After handling raw meat, poultry, or seafood
- After cleaning or sanitizing
- After eating, drinking, or smoking
        `,
        type: 'activity',
        duration: 4,
        completed: false
      },
      {
        id: 'knowledge-check',
        title: 'Knowledge Check',
        content: `
# Quick Knowledge Check

## Question 1: Temperature Danger Zone
What is the temperature danger zone for food safety?

A) 32°F - 100°F
B) 40°F - 140°F ✓
C) 50°F - 150°F
D) 60°F - 160°F

## Question 2: Handwashing Duration
How long should you scrub your hands when washing?

A) 10 seconds
B) 15 seconds  
C) 20 seconds ✓
D) 30 seconds

## Question 3: Cold Storage Temperature
What temperature should cold storage be maintained at?

A) Below 32°F
B) Below 40°F ✓
C) Below 50°F
D) Below 60°F

**Great job!** You're demonstrating good understanding of food safety principles.
        `,
        type: 'quiz',
        duration: 3,
        completed: false
      },
      {
        id: 'summary',
        title: 'Lesson Summary',
        content: `
# Congratulations! 🎉

You have successfully completed the Food Safety Fundamentals lesson!

## What You've Learned:
✅ **Temperature Control**: Understanding danger zones and safe temperatures
✅ **Personal Hygiene**: Proper handwashing techniques and timing
✅ **Food Safety Principles**: Key concepts for safe food handling
✅ **Knowledge Application**: Demonstrated understanding through activities

## Key Takeaways:
- Always maintain proper temperatures
- Wash hands frequently and thoroughly
- Monitor food safety continuously
- Document and take corrective actions

## Next Steps:
- Practice these techniques in your daily work
- Complete the final assessment quiz
- Move on to the next module: "Advanced Food Safety"

## Certification:
You have earned **15 points** toward your Food Safety Certification!

Keep up the excellent work in your learning journey!
        `,
        type: 'summary',
        duration: 2,
        completed: false
      }
    ];

    return {
      id: id,
      title: 'Food Safety Fundamentals',
      description: 'Learn essential food safety protocols and hygiene practices',
      document_id: 1,
      module_order: 1,
      estimated_duration: 17,
      difficulty_level: 'Beginner',
      learning_objectives: [
        'Understand basic food safety principles and temperature control',
        'Apply proper personal hygiene practices in food service',
        'Identify and prevent cross-contamination risks',
        'Implement proper food storage and handling procedures'
      ],
      prerequisites: [
        'Basic understanding of workplace safety',
        'Completion of orientation training'
      ],
      category: 'safety',
      sessions_count: 1,
      created_at: new Date().toISOString(),
      updated_at: null,
      module_metadata: null,
      steps: mockSteps,
      progress: 45,
      completed: false
    };
  };

  const handleStepComplete = async () => {
    if (!lesson) return;

    const updatedSteps = [...lesson.steps];
    updatedSteps[currentStepIndex].completed = true;

    const completedStepsCount = updatedSteps.filter(step => step.completed).length;
    const newProgress = (completedStepsCount / updatedSteps.length) * 100;
    const isLessonCompleted = newProgress === 100;

    setLesson({
      ...lesson,
      steps: updatedSteps,
      progress: newProgress,
      completed: isLessonCompleted
    });

    toast.success('Step completed!');

    if (isLessonCompleted) {
      toast.success('🎉 Lesson completed! Great job!');
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < (lesson?.steps.length || 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
    const { user } = useAuth();

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'introduction': return <BookOpen className="h-5 w-5" />;
      case 'content': return <FileText className="h-5 w-5" />;
      case 'activity': return <Target className="h-5 w-5" />;
      case 'quiz': return <Lightbulb className="h-5 w-5" />;
      case 'summary': return <Award className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'introduction': return 'from-blue-500 to-cyan-500';
      case 'content': return 'from-green-500 to-emerald-500';
      case 'activity': return 'from-orange-500 to-yellow-500';
      case 'quiz': return 'from-purple-500 to-pink-500';
      case 'summary': return 'from-indigo-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-800">Loading Lesson...</h2>
            <p className="text-gray-600 text-center">Fetching lesson data from server...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error || !lesson) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 flex items-center justify-center"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Lesson Not Found</h2>
            <p className="text-gray-600">{error || 'The requested lesson could not be found.'}</p>
            <Button 
              onClick={() => {
                if(user?.role === 'admin'){

                      navigate('/admin/lessons')
}else{

    navigate('/crew/lessons')
}
  
              
            }} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const currentStep = lesson.steps[currentStepIndex];

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-blue-200/50 shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                if(user?.role === 'admin'){

                      navigate('/admin/lessons')
}else{

    navigate('/crew/lessons')
}
  
              
            }} 
                  className="bg-white/80 border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lessons
                </Button>
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
                <p className="text-sm text-gray-600">Module {lesson.module_order} • {lesson.difficulty_level}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                {lesson.estimated_duration} min
              </Badge>
              
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{Math.round(lesson.progress)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={lesson.progress} className="h-2 bg-blue-100" />
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">Lesson Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lesson.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      index === currentStepIndex
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300'
                        : step.completed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentStepIndex(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        getStepIcon(step.type)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        index === currentStepIndex ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.duration} min
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl min-h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getStepColor(currentStep.type)} flex items-center justify-center shadow-lg`}>
                      {getStepIcon(currentStep.type)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {currentStep.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 capitalize">
                        {currentStep.type} • Step {currentStepIndex + 1} of {lesson.steps.length}
                      </p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={currentStep.completed ? "default" : "outline"}
                    className={`${
                      currentStep.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    } px-4 py-2`}
                  >
                    {currentStep.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent ref={stepRef} className="prose max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: currentStep.content.replace(/\n/g, '<br>').replace(/##/g, '<h2>').replace(/#/g, '<h1>') 
                  }}
                />
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between mt-8"
            >
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="bg-white/80 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Step
              </Button>

              <div className="flex items-center space-x-4">
                {!currentStep.completed && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleStepComplete}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleNextStep}
                    disabled={currentStepIndex === lesson.steps.length - 1}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 disabled:opacity-50"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LessonDetail;