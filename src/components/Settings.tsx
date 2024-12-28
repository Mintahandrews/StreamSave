import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useVideoStore } from '@/store/useVideoStore';

export function Settings() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { clearHistory } = useVideoStore();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-10 h-10 p-0"
      >
        <SettingsIcon className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          <div className="space-y-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={clearHistory}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-red-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Clear Download History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}