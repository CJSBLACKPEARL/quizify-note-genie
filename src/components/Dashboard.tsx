import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock, 
  Plus, 
  FileText,
  Award,
  Calendar,
  CheckCircle,
  FileImage,
  FilePdf,
  Upload,
  Crown
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  currentPlan: string;
}

const Dashboard = ({ userName, currentPlan }: DashboardProps) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const stats = {
    totalQuizzes: 15,
    averageScore: 78,
    studyStreak: 7,
    totalStudyTime: 45
  };

  const recentQuizzes = [
    { id: 1, title: 'Biology Chapter 5', score: 85, date: '2 hours ago', questions: 10 },
    { id: 2, title: 'Physics Laws', score: 72, date: '1 day ago', questions: 8 },
    { id: 3, title: 'Chemistry Basics', score: 90, date: '2 days ago', questions: 12 },
    { id: 4, title: 'Math Derivatives', score: 68, date: '3 days ago', questions: 15 }
  ];

  const getWordLimit = () => {
    switch (currentPlan) {
      case 'free': return 500;
      case 'student': return 2000;
      case 'premium': return Infinity;
      default: return 500;
    }
  };

  const handleGenerateQuiz = async () => {
    if (!notes.trim()) return;
    
    const wordCount = notes.trim().split(/\s+/).length;
    const limit = getWordLimit();
    
    if (limit !== Infinity && wordCount > limit) {
      alert(`Your text has ${wordCount} words, but your ${currentPlan} plan allows only ${limit} words.`);
      return;
    }

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      alert('Quiz generated successfully! (This is a demo)');
      setNotes('');
    }, 2000);
  };

  const currentWordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
  const wordLimit = getWordLimit();

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
              <div className="text-2xl font-bold text-white">{stats.totalQuizzes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageScore}%</div>
              <Progress value={stats.averageScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Study Streak</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.studyStreak} days</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalStudyTime}h</div>
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
                  Paste your notes below and we'll create a personalized quiz for you
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
                <Textarea
                  placeholder="Paste your notes here... The AI will analyze your content and generate relevant quiz questions."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button 
                  onClick={handleGenerateQuiz}
                  disabled={!notes.trim() || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
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
                      <FilePdf className="h-6 w-6 text-red-400" />
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
                {recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{quiz.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">{quiz.questions} questions</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{quiz.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        quiz.score >= 80 ? 'text-green-400' : 
                        quiz.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {quiz.score}%
                      </div>
                      {quiz.score >= 80 && <CheckCircle className="h-4 w-4 text-green-400 mt-1" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
