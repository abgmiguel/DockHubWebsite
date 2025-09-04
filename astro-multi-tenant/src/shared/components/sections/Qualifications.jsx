import Skills from './Skills.jsx'
import TitleHeader from '../Headers/TitleHeader.jsx'

const Qualifications = ({ headerData = {}, skillsData = {} }) => {
  // Extract header data with defaults
  const {
    title = "Qualifications",
    description = "Over the past two decades, I've had the privilege of bringing a wide range of innovative projects to market. From leading teams across the world to achieve multiple world and U.S. championships, to spearheading the development of cutting-edge and highly successful technologies, my journey has been both challenging and rewarding. I have met many interesting people, and feel thankful for all my experiences.",
    image = "/images/cartoon_preston2.png",
    imageDesc = "Preston Garrison"
  } = headerData;

  // Get skills array from data
  const skills = skillsData.skills || [];

  return (
    <>
      <TitleHeader
        title={title}
        description={description}
        image={image}
        imageDesc={imageDesc}
      />
      
      {/* Loop through all skill categories */}
      {skills.map((skillCategory, index) => (
        <Skills
          key={index}
          color={skillCategory.color}
          items={skillCategory.items || []}
          title={skillCategory.name}
          description={skillCategory.description}
        />
      ))}
    </>
  )
}

export default Qualifications