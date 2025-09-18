import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

interface FlashcardsProps {
  flashcards: Flashcard[];
  title: string;
  onBackToDashboard: () => void;
}

const Flashcards = ({ flashcards, title, onBackToDashboard }: FlashcardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(flashcards);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

  const currentCard = shuffledCards[currentIndex];

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setShuffledCards(flashcards);
  };

  const markAsKnown = () => {
    setKnownCards(prev => new Set([...prev, currentCard.id]));
    if (currentIndex < shuffledCards.length - 1) {
      nextCard();
    }
  };

  const markAsUnknown = () => {
    setKnownCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });
    if (currentIndex < shuffledCards.length - 1) {
      nextCard();
    }
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(flashcards.map(card => card.category)));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBackToDashboard} variant="outline" className="text-white border-gray-600">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <div className="flex gap-2">
            <Button onClick={shuffleCards} variant="outline" className="text-white border-gray-600">
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={resetStudy} variant="outline" className="text-white border-gray-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Progress: {currentIndex + 1} of {shuffledCards.length}</span>
            <span className="text-green-400">Known: {knownCards.size} cards</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-6">
          <Card 
            className="w-full max-w-2xl h-80 cursor-pointer bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className={`h-full flex items-center justify-center p-8 relative transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 backface-hidden ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="text-center">
                  <div className="text-sm text-purple-400 mb-4 bg-purple-900/30 px-3 py-1 rounded-full">
                    {currentCard?.category}
                  </div>
                  <p className="text-xl text-white leading-relaxed">{currentCard?.front}</p>
                  <p className="text-gray-400 mt-4 text-sm">Click to reveal answer</p>
                </div>
              </div>

              {/* Back */}
              <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 ${isFlipped ? 'rotate-y-0' : ''}`}>
                <div className="text-center">
                  <div className="text-sm text-green-400 mb-4 bg-green-900/30 px-3 py-1 rounded-full">
                    Answer
                  </div>
                  <p className="text-xl text-white leading-relaxed">{currentCard?.back}</p>
                  <p className="text-gray-400 mt-4 text-sm">Click to flip back</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation and Actions */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <Button 
            onClick={prevCard} 
            disabled={currentIndex === 0}
            variant="outline" 
            className="text-white border-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isFlipped && (
            <>
              <Button 
                onClick={markAsUnknown}
                variant="outline" 
                className="text-red-400 border-red-600 hover:bg-red-900/20"
              >
                Don't Know
              </Button>
              <Button 
                onClick={markAsKnown}
                variant="outline" 
                className="text-green-400 border-green-600 hover:bg-green-900/20"
              >
                I Know This
              </Button>
            </>
          )}

          <Button 
            onClick={nextCard} 
            disabled={currentIndex === shuffledCards.length - 1}
            variant="outline" 
            className="text-white border-gray-600 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Categories Overview */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Categories in this set:</h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueCategories().map((category, index) => (
              <div key={index} className="bg-gray-800 text-purple-400 px-3 py-1 rounded-full text-sm border border-gray-700">
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* Study Stats */}
        {currentIndex === shuffledCards.length - 1 && (
          <div className="mt-8 text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-2">Study Session Complete!</h3>
            <p className="text-gray-400 mb-4">
              You've reviewed all {shuffledCards.length} flashcards. 
              You marked {knownCards.size} as known ({Math.round((knownCards.size / shuffledCards.length) * 100)}%).
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={resetStudy} className="bg-purple-600 hover:bg-purple-700">
                Study Again
              </Button>
              <Button onClick={onBackToDashboard} variant="outline" className="text-white border-gray-600">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        `
      }} />
    </div>
  );
};

export default Flashcards;