import TitleHeader from '../Headers/TitleHeader.jsx'

const Experiences = ({ header = {}, experienceItems = [] }) => {
  // Extract header data with defaults
  const {
    title = "Experiences",
    description = 'As the owner of my own companies for the past two decades, I have had to wear many hats, and have been able to master many roles. I have been lucky to travel the world, even winning world championships watching our amazing drone hardware and software in action.',
    image = "/images/revoltosd_group_black.jpg",
    imageDesc = "Revolt Flight Controller"
  } = header;

  return (
    <>
      <TitleHeader
        title={title}
        description={description}
        image={image}
        imageDesc={imageDesc}
      />

      <div className="flex items-center justify-center w-full p-8">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/HonTgEm6PhM?si=FRy156PkIBhIV4Do"
          title="YouTube video player"
          frameBorder="0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </>
  )
}

export default Experiences
