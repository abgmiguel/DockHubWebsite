import React from 'react';
import SimpleVideoPlayer from '../Media/SimpleVideoPlayer';

interface VideoSectionProps {
  data: any;
}

const VideoSection: React.FC<VideoSectionProps> = ({ data }) => {
  const videoData = data;
  return (
    <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Features</h2>
          <p className="text-lg text-gray-300">Check out our videos of us in action</p>
        </div>
        <SimpleVideoPlayer videos={videoData} />
      </div>
    </div>
  );
};

export default VideoSection;