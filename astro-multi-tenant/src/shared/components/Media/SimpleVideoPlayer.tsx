import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon } from '../Icons/Icons';

interface Video {
  id: number;
  filename: string;
  title: string;
  url: string;
}

interface SimpleVideoPlayerProps {
  videos: Video[];
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ videos }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentVideoIndex];

  // Load video when component mounts or video changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentVideoIndex]);

  // Handle video ended
  const handleVideoEnded = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0); // Loop back to first
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
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

  // Select video
  const selectVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  if (videos.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">No videos available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ maxWidth: '1280px', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          style={{ maxHeight: '720px' }}
          src={currentVideo.url}
          onEnded={handleVideoEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => {
            // Ensure play state is synced after video loads
            if (videoRef.current && videoRef.current.autoplay) {
              setIsPlaying(!videoRef.current.paused);
            }
          }}
          muted={isMuted}
          autoPlay
          playsInline
        />

        {/* Simple Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMuted ? <VolumeXIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
            </button>
            <span className="text-white text-sm">
              {currentVideo.title}
            </span>
          </div>
        </div>
      </div>

      {/* Text Links */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => selectVideo(index)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                index === currentVideoIndex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {index === currentVideoIndex && isPlaying && (
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              )}
              {video.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;