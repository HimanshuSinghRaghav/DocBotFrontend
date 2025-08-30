import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Globe, LogIn, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// This would normally be imported from a Clark SDK or API client
const CLARK_CLIENT_ID = 'your-clark-client-id';
const CLARK_REDIRECT_URI = `${window.location.origin}/login/clark/callback`;

export default function ClarkLoginPage() {
  const { user, loading, signInWithClark } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle Clark login callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (code && state) {
      handleClarkCallback(code, state);
    }
  }, []);

  const handleClarkCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      await signInWithClark(code, state);
      toast.success('Login with Clark successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login with Clark failed');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateClarkLogin = () => {
    setIsLoading(true);
    
    // Generate a state parameter to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('clark_auth_state', state);
    
    // Redirect to Clark authentication endpoint
    const authUrl = new URL('https://auth.clark.example/oauth2/authorize');
    authUrl.searchParams.append('client_id', CLARK_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', CLARK_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'profile email');
    
    window.location.href = authUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-blue-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (user) {
    const dashboardPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'shift_lead' ? '/shift-lead' : '/crew';
    return <Navigate to={dashboardPath} replace />;
  }

  const handleRegularLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-slate-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 z-10"
      >
        {/* Language Selector */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
            <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-blue-100 shadow-md hover:bg-white/90 transition-all duration-200">
              <Globe className="h-4 w-4 mr-2 text-blue-600" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-blue-100">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="shadow-xl border border-blue-50 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="text-center space-y-4 border-b border-blue-50 bg-gradient-to-br from-white to-blue-50 pb-8">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3"
              >
                <Shield className="h-10 w-10 text-white drop-shadow" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                  Clark Login
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-1">
                  {t('welcome')} - Sign in with Clark SSO
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-8 pb-6">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    onClick={initiateClarkLogin}
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-xl shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5 mr-2" />
                        Connecting to Clark...
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Sign in with Clark
                      </div>
                    )}
                  </Button>
                </motion.div>

                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={handleRegularLogin}
                    className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 rounded-xl shadow-sm transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in with Email
                  </Button>
                </motion.div>
              </div>
            </CardContent>

            <CardFooter className="bg-gradient-to-br from-slate-50 to-blue-50 border-t border-blue-50 px-6 py-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full"
              >
                <div className="flex items-center text-sm text-blue-700">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  <p className="font-medium">
                    Enterprise single sign-on powered by Clark
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Access all your F&B training resources with your company credentials
                </p>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
