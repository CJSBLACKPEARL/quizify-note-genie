
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, User, LogOut } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onLogout?: () => void;
  userName?: string;
}

const Header = ({ isAuthenticated, onAuthClick, onLogout, userName }: HeaderProps) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold text-white">QuizifyGenie</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="h-5 w-5" />
                  <span>Welcome, {userName}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={onAuthClick}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
