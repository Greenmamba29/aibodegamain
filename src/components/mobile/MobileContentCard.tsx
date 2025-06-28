import React, { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { App } from '../../lib/supabase';
import { ContentCardModal } from '../home/ContentCardModal';
import { toast } from 'react-hot-toast';

interface MobileContentCardProps {
  app: App;
  onLike: (appId: string) => void;
  onShare: (app: App) => void;
  onBookmark: (appId: string) => void;
  onAction: (app: App) => void;
  isLiked: boolean;
  isBookmarked: boolean;
  getActionButtonText: (app: App) => string;
  getActionButtonIcon: (app: App) => any;
}

export const MobileContentCard: React.FC<MobileContentCardProps> = ({
  app,
  onLike,
  onShare,
  onBookmark,
  onAction,
  isLiked,
  isBookmarked,
  getActionButtonText,
  getActionButtonIcon
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ActionIcon = getActionButtonIcon(app);

  // Check if app has demo video
  const hasVideo = app.demo_url && (
    app.demo_url.includes('.mp4') || 
    app.demo_url.includes('.webm') || 
    app.demo_url.includes('video')
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowVideo(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const toggleVideo = () => {
    if (hasVideo) {
      setShowVideo(!showVideo);
      if (!showVideo && videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(app);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(app.id);
    toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(app);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(app.id);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  return (
    <>
      <div className="snap-start h-screen relative flex flex-col" onClick={handleCardClick}>
        {/* App Background/Media */}
        <div className="flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-black">
          {showVideo && hasVideo ? (
            // Video Content
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={app.demo_url}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                onClick={togglePlayPause}
              />
              
              {/* Video Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ) : (
            // Image Content
            <>
              {app.screenshots && app.screenshots[0] ? (
                <div className="relative w-full h-full" onClick={toggleVideo}>
                  <img
                    src={app.screenshots[0]}
                    alt={app.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  
                  {/* Video Play Button Overlay */}
                  {hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                        <Play className="w-10 h-10 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center" onClick={toggleVideo}>
                  <div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center relative">
                    <span className="text-white font-bold text-6xl">
                      {app.title.charAt(0)}
                    </span>
                    
                    {/* Video Play Button Overlay */}
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                          <Play className="w-8 h-8 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            {app.developer?.avatar_url ? (
              <img
                src={app.developer.avatar_url}
                alt={app.developer.full_name}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white font-semibold text-sm">
                  {app.developer?.full_name?.charAt(0) || 'D'}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">
                {app.developer?.full_name || 'Developer'}
              </p>
              <p className="text-white/80 text-xs">{app.category?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-10">
          <button
            onClick={handleLikeClick}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          
          <button
            onClick={handleShareClick}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
          
          <button 
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handleBookmarkClick}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-white text-white' : 'text-white'}`} />
          </button>

          {/* Video indicator */}
          {hasVideo && (
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{app.title}</h3>
            <p className="text-white/90 text-sm mb-3 line-clamp-2">{app.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
              <span>{app.downloads_count.toLocaleString()} downloads</span>
              <span>⭐ {app.rating_average.toFixed(1)}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                app.pricing_type === 'free' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {app.pricing_type === 'free' ? 'Free' : `$${app.price}`}
              </span>
              {hasVideo && (
                <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                  📹 Demo
                </span>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full bg-white text-black hover:bg-gray-100 font-semibold"
              onClick={handleActionClick}
            >
              <ActionIcon className="w-4 h-4 mr-2" />
              {getActionButtonText(app)}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Card Modal */}
      <ContentCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        app={app}
        onAppAction={onAction}
        isPurchased={false}
        getActionButtonText={getActionButtonText}
        getActionButtonIcon={getActionButtonIcon}
      />
    </>
  );
};