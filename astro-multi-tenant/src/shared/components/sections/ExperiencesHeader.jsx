import TitleHeader from '../Headers/TitleHeader.jsx'

const ExperiencesHeader = ({ data = {} }) => {
  const {
    title = "Experiences",
    description = 'As the owner of my own companies for the past two decades, I have had to wear many hats, and have been able to master many roles. I have been lucky to travel the world, even winning world championships watching our amazing drone hardware and software in action.',
    image = "/images/revoltosd_group_black.jpg",
    imageDesc = "Revolt Flight Controller"
  } = data;

  return (
    <TitleHeader
      title={title}
      description={description}
      image={image}
      imageDesc={imageDesc}
    />
  )
}

export default ExperiencesHeader