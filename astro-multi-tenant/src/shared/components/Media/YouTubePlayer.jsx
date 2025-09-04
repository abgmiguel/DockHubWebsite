import React, { useState } from 'react';

const YouTubePlayer = ({ videos = [] }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  if (videos.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No videos available</p>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?rel=0`}
          title={currentVideo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Video Title and Description */}
      <div className="mt-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentVideo.title}</h3>
        {currentVideo.description && (
          <p className="text-gray-600">{currentVideo.description}</p>
        )}
      </div>

      {/* Video Selector (if multiple videos) */}
      {videos.length > 1 && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => setCurrentVideoIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  index === currentVideoIndex
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow'
                }`}
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;