import Skills from './Skills.jsx'

const QualificationsSkills = ({ data = {} }) => {
  const skills = data.skills || [];

  return (
    <div>
      {skills.map((skillCategory, index) => (
        <Skills
          key={index}
          color={skillCategory.color}
          items={skillCategory.items || []}
          title={skillCategory.name}
          description={skillCategory.description}
        />
      ))}
    </div>
  )
}

export default QualificationsSkills