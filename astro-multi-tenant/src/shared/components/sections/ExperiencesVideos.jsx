import YouTubePlayer from '../Media/YouTubePlayer.jsx'

const ExperiencesVideos = ({ data = [] }) => {
  return (
    <div className="flex items-center justify-center w-full p-8">
      <YouTubePlayer videos={data} />
    </div>
  )
}

export default ExperiencesVideos