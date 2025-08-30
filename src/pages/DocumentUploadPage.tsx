import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Loader2, Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Document categories for F&B operations
const documentCategories = [
  { value: 'food_safety', label: 'Food Safety' },
  { value: 'equipment_handling', label: 'Equipment Handling' },
  { value: 'cleaning_schedules', label: 'Cleaning Schedules' },
  { value: 'allergen_control', label: 'Allergen Control' },
  { value: 'cash_procedures', label: 'Cash & Shift Procedures' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'inventory_management', label: 'Inventory Management' },
  { value: 'quality_control', label: 'Quality Control' }
];

// Document categories for F&B operations


export default function DocumentUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form states
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL for PDF files
      if (selectedFile.type === 'application/pdf') {
        const fileUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(fileUrl);
      } else {
        setPreviewUrl(null);
        toast.error("Please select a PDF file");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !file) {
      toast.error("Please fill in all fields and upload a document");
      return;
    }
    
    setIsUploading(true);
    setError(null); // Clear any previous errors
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('document_type', "sop");
      formData.append('version', "1.0");
      formData.append('language', "en");
      formData.append('effective_date', "2024-03-15");
      formData.append('uploaded_by', user?.id || '');
      formData.append('uploaded_by_name', user?.name || '');
      
      // Get the API URL from environment or use default
      const apiUrl =  'https://9765cebb345d.ngrok-free.app';
      
      // Make API call using axios
      const response = await axios.post(`${apiUrl}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        timeout: 30000, // 30 second timeout for file uploads
      });
      console.log(response);
      
      if (response.data.id) {
        toast.success("Upload complete! We’re processing your document and generating quiz procedures. Please wait a few minutes.");
        navigate('/chat');
        setUploadSuccess(true);
        setError(null);
        
        // Reset form after successful upload
        setTimeout(() => {
          setTitle('');
          setFile(null);
          setPreviewUrl(null);
          setUploadSuccess(false);
        }, 3000);
      } else {
        const errorMessage = response.data.message || "Upload failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = "Failed to upload document. Please try again.";
      
      try {
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.message || error.response.data?.detail || 'Upload failed';
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "No response from server. Please check your connection.";
        } else if (error.message) {
          // Axios error message
          errorMessage = error.message;
        }
      } catch (parseError) {
        console.error('Error parsing error details:', parseError);
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      // Update state with error message
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setError(null);
    if (title && file) {
      handleSubmit(new Event('submit') as any);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up preview URL to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2 hover:bg-blue-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800">SOP Document Upload</h1>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle>Upload SOP Document</CardTitle>
                <CardDescription>
                  Add a new standard operating procedure document for staff training and reference
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Food Safety Protocol V2.1"
                      className="border-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>
                  
          
               
                
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Document (PDF only)</Label>
                    <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer">
                      <Input
                        id="file"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label htmlFor="file" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                        {file ? (
                          <>
                            <FileText className="h-10 w-10 text-blue-500" />
                            <p className="text-sm font-medium text-blue-700">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-blue-400" />
                            <p className="text-sm font-medium text-blue-600">
                              Click to select a PDF file
                            </p>
                            <p className="text-xs text-gray-500">
                              Max file size: 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">Upload Failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Retry
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearError}
                            className="text-red-500 hover:bg-red-100"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isUploading || uploadSuccess || !title || !file}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Uploaded Successfully
                      </>
                    ) : (
                      'Upload Document'
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-blue-100 bg-blue-50/50 text-xs text-gray-500 px-6 py-3">
                <span>Uploaded by: {user?.name || 'Staff Member'}</span>
                <span>Documents are reviewed before being published</span>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-blue-800">Document Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">PDF Format Required</h4>
                      <p className="text-sm text-gray-600">All SOPs must be uploaded as PDF files for consistency</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Clear Titles</h4>
                      <p className="text-sm text-gray-600">Include version numbers in document titles for tracking</p>
                    </div>
                  </div>
                  
                
                  
                 
                  
                  <div className="mt-6 pt-4 border-t border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Why Standardize SOPs?</h4>
                    <p className="text-sm text-gray-600">
                      Standardized SOPs ensure consistent training, improved compliance, 
                      and better retention of critical operational procedures across all staff.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {previewUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <Card className="shadow-lg border-blue-100">
                  <CardHeader className="py-3 border-b border-blue-100">
                    <CardTitle className="text-sm font-medium">Document Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[300px]">
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full" 
                      title="Document Preview"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
