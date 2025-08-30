import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Globe, Mail, Lock, UserPlus, User, ChevronRight, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserRole } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const { user, signUp, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('satish@test.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [name, setname] = useState('Satish Kumar');
  const [role, setRole] = useState<UserRole>('crew');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100">
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name, role);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
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
                <UserPlus className="h-10 w-10 text-white drop-shadow" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-1">
                  Sign up for F&B Training
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="h-12 text-base pl-4 border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl shadow-sm"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="h-12 text-base pl-4 border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl shadow-sm"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Role
                  </Label>
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="w-full h-12 text-base pl-4 border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl shadow-sm">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="shift_lead">Shift Lead</SelectItem>
                      <SelectItem value="crew">Crew Member</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="h-12 text-base pl-4 border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl shadow-sm"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="h-12 text-base pl-4 border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-xl shadow-sm"
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5 mr-2" />
                        {/* Creating Account... */}
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </motion.div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="w-full flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="bg-gradient-to-br from-slate-50 to-blue-50 border-t border-blue-50 px-6 py-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full"
              >
                <p className="text-sm text-blue-700 mb-1 font-medium flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Note:
                </p>
                <p className="text-xs text-gray-600">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                  For demonstration purposes, all roles are available for selection.
                </p>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
