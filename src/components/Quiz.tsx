
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  title: string;
  questions: Question[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

const Quiz = ({ title, questions, onComplete, onBack }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const correctAnswers = selectedAnswers.reduce((acc, answer, index) => {
      return answer === questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setIsComplete(true);
    onComplete(finalScore);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setIsComplete(false);
    setScore(0);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Quiz Complete!</CardTitle>
              <CardDescription className="text-gray-400">
                {title}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-white">
                {score}%
              </div>
              <div className="text-lg text-gray-300">
                You got {selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length} out of {questions.length} questions correct
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={restartQuiz} variant="outline" className="border-gray-600 text-gray-300">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">{title}</CardTitle>
              <span className="text-gray-400">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <h2 className="text-xl text-white font-medium">
              {currentQ.question}
            </h2>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-purple-500 bg-purple-600/20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-500 mr-3 flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
