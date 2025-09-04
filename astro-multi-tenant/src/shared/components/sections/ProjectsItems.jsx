import ProjectItem from '../Cards/ProjectItem.jsx'

const ProjectsItems = ({ data = [] }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 p-[20px] w-full md:w-[960px]">
        {data.map(item => (
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
  )
}

export default ProjectsItems