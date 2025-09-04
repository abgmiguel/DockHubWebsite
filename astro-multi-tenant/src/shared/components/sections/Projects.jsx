import TitleHeader from '../Headers/TitleHeader.jsx'
import ProjectItem from '../Cards/ProjectItem.jsx'

const Projects = ({ projectItems = [], header = {} }) => {
  const {
    title = "Projects",
    description = 'Over the years I have taken part in creating many different technologies and projects.',
    image = "/images/h7group_trans.png",
    imageDesc = "Lightning Flight Controller"
  } = header;

  return (
    <>
      <TitleHeader
        title={title}
        description={description}
        image={image}
        imageDesc={imageDesc}
      />

      <div className="flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 p-[20px] w-full md:w-[960px]">
          {projectItems.map(item => (
            <ProjectItem
              key={item.id}
              image_name={item.image_name}
              image_desc={item.image_desc}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Projects