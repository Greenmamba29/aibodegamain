import React from 'react'
import { Github, Twitter, Mail, Heart } from 'lucide-react'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { toast } from 'react-hot-toast'

export const Footer: React.FC = () => {
  const handleNavigation = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      window.location.href = path;
    }
  };

  const handleContactSupport = () => {
    toast.success('Support request sent! Our team will contact you shortly.');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h2 className="text-xl font-bold">Vibe Store</h2>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Discover, share, and monetize AI-powered applications. The premier marketplace for indie AI developers and enthusiasts.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <button 
                onClick={handleContactSupport} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('/')} 
                  className="hover:text-white transition-colors"
                >
                  Browse Apps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/#collections')} 
                  className="hover:text-white transition-colors"
                >
                  Collections
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/#featured')} 
                  className="hover:text-white transition-colors"
                >
                  Featured
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/?sort=newest')} 
                  className="hover:text-white transition-colors"
                >
                  New Releases
                </button>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="font-semibold mb-4">Developers</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleNavigation('/developer')} 
                  className="hover:text-white transition-colors"
                >
                  Submit App
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/developer')} 
                  className="hover:text-white transition-colors"
                >
                  Developer Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('https://docs.vibestore.ai')} 
                  className="hover:text-white transition-colors"
                >
                  API Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('https://docs.vibestore.ai/guidelines')} 
                  className="hover:text-white transition-colors"
                >
                  Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Vibe Store. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <LanguageSwitcher variant="dropdown" size="sm" />
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by indie developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}