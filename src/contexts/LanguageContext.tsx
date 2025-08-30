import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'es';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    es: 'Tablero',
  },
  chat: {
    en: 'Chat Assistant',
    hi: 'चैट सहायक',
    es: 'Asistente de Chat',
  },
  procedures: {
    en: 'Procedures',
    hi: 'प्रक्रियाएं',
    es: 'Procedimientos',
  },
  quiz: {
    en: 'Quiz',
    hi: 'प्रश्नोत्तरी',
    es: 'Cuestionario',
  },
  login: {
    en: 'Login',
    hi: 'लॉगिन',
    es: 'Iniciar Sesión',
  },
  logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
    es: 'Cerrar Sesión',
  },
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत',
    es: 'Bienvenido',
  },
  training: {
    en: 'Training',
    hi: 'प्रशिक्षण',
    es: 'Entrenamiento',
  },
  documents: {
    en: 'SOP Documents',
    hi: 'एसओपी दस्तावेज',
    es: 'Documentos SOP',
  },
  progress: {
    en: 'Progress',
    hi: 'प्रगति',
    es: 'Progreso',
  },
  completed: {
    en: 'Completed',
    hi: 'पूर्ण',
    es: 'Completado',
  },
  next: {
    en: 'Next',
    hi: 'अगला',
    es: 'Siguiente',
  },
  previous: {
    en: 'Previous',
    hi: 'पिछला',
    es: 'Anterior',
  },
  submit: {
    en: 'Submit',
    hi: 'जमा करें',
    es: 'Enviar',
  },
  retry: {
    en: 'Retry',
    hi: 'पुनः प्रयास',
    es: 'Reintentar',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'hi', 'es'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}