import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-api-url.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors and auto-saving tokens
api.interceptors.response.use(
  (response) => {
    // Auto-save token if it comes in the response
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          // window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Forbidden resource');
          break;
        default:
          // Other errors
          console.error('API Error:', error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/users/login', { email, password });
    console.log(response.data);
    if (response.data.token) {
      // localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string, role: string) => {
    const response = await api.post('/api/users', { email, password, name, role });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    // return api.post('/auth/logout');
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  loginWithClark: async (code: string, state: string) => {
    const response = await api.post('/auth/clark', { code, state });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }
};

// Lessons related API calls
export const lessonsApi = {
  getLessons: async () => {
    const response = await api.get('api/modules');
    return response.data;
  },
  
  getLessonById: async (id: string) => {
    const response = await api.get(`/api/modules`);
    console.log(response,"response")
     return response.data.find((item: LessonDetailResponse) => {
      return item.id.toString() === id;
    });
  },
  
  updateLessonProgress: async (id: string, progress: number) => {
    const response = await api.put(`/lessons/${id}/progress`, { progress });
    return response.data;
  },
  
  markLessonComplete: async (id: string) => {
    const response = await api.put(`/lessons/${id}/complete`);
    return response.data;
  }
};

// Quiz related API calls
export const quizApi = {
  getQuizzes: async () => {
    const response = await api.get('/api/quizzes');
    return response.data;
  },
  
  getQuizById: async (id: string) => {
    const response = await api.get(`/api/quizzes/${id}`);
    return response.data;
  },
  
  submitQuizAnswer: async (quizId: string, questionId: string, answer: string | string[]) => {
    const response = await api.post(`/api/quizzes/${quizId}/submit`, {
      questionId,
      answer
    });
    return response.data;
  },
  
  submitQuiz: async (quizId: string, answers: Record<string, string | string[]>) => {
    const response = await api.post(`/api/quizzes/${quizId}/complete`, {
      answers
    });
    return response.data;
  },
  
  getQuizResults: async (quizId: string, attemptId: string) => {
    const response = await api.get(`/api/quizzes/${quizId}/results/${attemptId}`);
    return response.data;
  }
};

// User related API calls
export const userApi = {
  getUser: async (id: string) => {
    return api.get(`/users/${id}`);
  },
  
  updateUser: async (id: string, data: Record<string, unknown>) => {
    return api.put(`/users/${id}`, data);
  }
};

// Export the axios instance for direct use
export default api;

// Types for API responses
export interface LessonResponse {
  title: string;
  description: string;
  document_id: number;
  module_order: number;
  estimated_duration: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  learning_objectives?: string[];
  prerequisites?: string[];
  category?: string;
  sessions_count?: number;
  created_at?: string;
  updated_at?: string | null;
  module_metadata?: Record<string, unknown> | null;
  id?: string | number;
  progress?: number;
  completed?: boolean;
  locked?: boolean;
}

// Lesson detail step interface
export interface LessonStepResponse {
  step_number: number;
  step_description: string;
}

// Lesson detail API response interface
export interface LessonDetailResponse {
  title: string;
  description: string;
  document_id: number;
  module_order: number;
  estimated_duration: number;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  learning_objectives: string[];
  prerequisites: string[];
  category: string;
  id: number;
  module_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  sessions_count: number;
  steps?: LessonStepResponse[]; // Optional since it might not always be present
}

// Quiz interfaces
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
}

export interface QuizResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  estimated_duration: number; // in minutes
  total_questions: number;
  passing_score: number; // percentage
  max_attempts?: number;
  time_limit?: number; // in minutes
  created_at: string;
  updated_at: string;
  // User-specific data
  attempts?: number;
  best_score?: number;
  completed?: boolean;
  last_attempt_date?: string;
}

export interface QuizDetailResponse extends QuizResponse {
  questions: QuizQuestion[];
  instructions?: string;
  prerequisites?: string[];
}

export interface QuizAttemptResponse {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number; // in seconds
  answers: Record<string, string | string[]>;
  started_at: string;
  completed_at: string;
}

export interface QuizResultResponse {
  attempt: QuizAttemptResponse;
  quiz: QuizResponse;
  questions: QuizQuestion[];
  user_answers: Record<string, string | string[]>;
  correct_answers: Record<string, string | string[]>;
  explanations: Record<string, string>;
}
