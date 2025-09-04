import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react';

interface Video {
  id: number;
  filename: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string | null;
  description?: string;
}

interface VideoPlayerProps {
  videos: Video[];
  autoPlay?: boolean;
  muted?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos, autoPlay = true, muted = true }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentVideoIndex];

  // Load video when index changes
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      setIsLoading(true);
      videoRef.current.load();
    }
  }, [currentVideoIndex, currentVideo]);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (hasInteracted && autoPlay) {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      // Loop back to first video
      setCurrentVideoIndex(0);
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (!hasInteracted) setHasInteracted(true);
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Update progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  // Seek video
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  // Go to specific video
  const selectVideo = (index: number) => {
    if (!hasInteracted) setHasInteracted(true);
    setCurrentVideoIndex(index);
  };

  // Skip to next video
  const skipToNext = () => {
    if (!hasInteracted) setHasInteracted(true);
    handleVideoEnded();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (videos.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No videos available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden group">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-auto"
          src={currentVideo.url}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Click to Play Overlay (before first interaction) */}
        {!hasInteracted && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 hover:bg-white/20 transition-colors">
              <Play className="w-16 h-16 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" fill="white" />}
              </button>

              {/* Skip to Next */}
              <button
                onClick={skipToNext}
                className="text-white hover:text-gray-300 transition-colors"
                title="Next Video"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {/* Current Video Title */}
              <span className="text-white text-sm font-medium">
                {currentVideo.title}
              </span>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Playlist */}
      <div className="mt-6">
        <h3 className="text-white text-lg font-semibold mb-4">Feature Demos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => selectVideo(index)}
              className={`relative group overflow-hidden rounded-lg transition-all duration-300 ${
                index === currentVideoIndex 
                  ? 'ring-2 ring-indigo-500 scale-95' 
                  : 'hover:scale-105'
              }`}
            >
              {/* Thumbnail or Placeholder */}
              <div className="aspect-video bg-gray-800 relative">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                
                {/* Play Icon */}
                {index === currentVideoIndex && isPlaying ? (
                  <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white" fill="white" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="p-3 bg-gray-900">
                <p className="text-sm text-gray-300 text-left truncate">
                  {video.title}
                </p>
                {video.duration && (
                  <p className="text-xs text-gray-500 text-left">
                    {video.duration}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;