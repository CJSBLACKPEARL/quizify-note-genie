import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Quiz from './Quiz';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock, 
  Plus, 
  FileText,
  Award,
  CheckCircle,
  FileImage,
  Upload,
  Crown,
  Loader2
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  currentPlan: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const Dashboard = ({ userName, currentPlan }: DashboardProps) => {
  const [notes, setNotes] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{ title: string; questions: Question[] } | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProgress(progress);

      // Load recent quizzes
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentQuizzes(quizzes || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getWordLimit = () => {
    switch (currentPlan) {
      case 'free': return 500;
      case 'student': return 2000;
      case 'premium': return Infinity;
      default: return 500;
    }
  };

  const handleGenerateQuiz = async () => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter some notes first!",
        variant: "destructive"
      });
      return;
    }

    const wordCount = notes.trim().split(/\s+/).length;
    const limit = getWordLimit();
    
    if (limit !== Infinity && wordCount > limit) {
      toast({
        title: "Word Limit Exceeded",
        description: `Your text has ${wordCount} words, but your ${currentPlan} plan allows only ${limit} words.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          notes: notes.trim(),
          title: quizTitle.trim() || 'Generated Quiz'
        }
      });

      if (error) throw error;

      setCurrentQuiz({
        title: data.title,
        questions: data.questions
      });
      
      toast({
        title: "Success",
        description: "Quiz generated successfully!",
      });
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = async (score: number) => {
    console.log('Quiz completed with score:', score);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update the quiz with the score
      if (currentQuiz) {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({ 
            score,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('title', currentQuiz.title)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error('Error updating quiz score:', updateError);
        }
      }

      // Update user progress
      const totalQuizzes = (userProgress?.total_quizzes || 0) + 1;
      const currentAvg = userProgress?.average_score || 0;
      const newAverage = ((currentAvg * (totalQuizzes - 1)) + score) / totalQuizzes;

      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          total_quizzes: totalQuizzes,
          average_score: newAverage,
          last_active: new Date().toISOString()
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
      } else {
        // Reload user data
        loadUserData();
      }

      toast({
        title: "Progress Saved",
        description: `Quiz completed with ${score}% score!`,
      });
      
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentQuiz(null);
    setNotes('');
    setQuizTitle('');
  };

  const currentWordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
  const wordLimit = getWordLimit();

  // If there's a current quiz, show the quiz component
  if (currentQuiz) {
    return (
      <Quiz
        title={currentQuiz.title}
        questions={currentQuiz.questions}
        onComplete={handleQuizComplete}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-400">Ready to create some awesome quizzes today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userProgress?.total_quizzes || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProgress?.average_score ? Math.round(userProgress.average_score) : 0}%
              </div>
              <Progress value={userProgress?.average_score || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Recent Activity</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userProgress?.last_active 
                  ? new Date(userProgress.last_active).toLocaleDateString()
                  : 'Never'
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Plan Status</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentPlan.toUpperCase()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Generator */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Generate New Quiz
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your notes below and we'll create a personalized quiz using AI
                </CardDescription>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {currentPlan.toUpperCase()} Plan
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {currentWordCount}/{wordLimit === Infinity ? '∞' : wordLimit} words
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title" className="text-white">Quiz Title (optional)</Label>
                  <Input
                    id="quiz-title"
                    placeholder="Enter quiz title..."
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">Notes Content</Label>
                  <Textarea
                    id="notes"
                    placeholder="Paste your notes here... The AI will analyze your content and generate relevant quiz questions."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button 
                  onClick={handleGenerateQuiz}
                  disabled={!notes.trim() || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Coming Soon Section */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                  Coming Soon - Premium Features
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced upload options for Premium subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="bg-red-600/20 rounded-full p-3">
                      <FileText className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">PDF Upload</h4>
                      <p className="text-sm text-gray-400">Upload PDF documents and convert them to quizzes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="bg-blue-600/20 rounded-full p-3">
                      <FileImage className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Photo Upload</h4>
                      <p className="text-sm text-gray-400">Upload photos of handwritten notes for quiz generation</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-600/30">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Available with Premium Plan</span>
                  </div>
                  {currentPlan !== 'premium' && (
                    <Badge className="bg-yellow-600 text-white">
                      Upgrade Required
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quizzes */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Recent Quizzes
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest quiz performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentQuizzes.length > 0 ? (
                  recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{quiz.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">{quiz.total_questions} questions</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(quiz.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          quiz.score >= 80 ? 'text-green-400' : 
                          quiz.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {quiz.score ? `${quiz.score}%` : 'Not completed'}
                        </div>
                        {quiz.score >= 80 && <CheckCircle className="h-4 w-4 text-green-400 mt-1" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quizzes yet</p>
                    <p className="text-sm">Create your first quiz to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;