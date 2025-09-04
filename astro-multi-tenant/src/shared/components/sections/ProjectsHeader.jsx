import TitleHeader from '../Headers/TitleHeader.jsx'

const ProjectsHeader = ({ data = {} }) => {
  const {
    title = "Projects",
    description = 'Over the years I have taken part in creating many different technologies and projects.',
    image = "/images/h7group_trans.png",
    imageDesc = "Lightning Flight Controller"
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

export default ProjectsHeader