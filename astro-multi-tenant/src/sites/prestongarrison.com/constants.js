// Import all data files
import projectsData from './data/projects.json';
import skillsData from './data/skills.json';
import experiencesData from './data/experiences.json';

// Export data in the format components expect
export const project_items = projectsData.items;
export const hardware = skillsData.hardware;
export const software = skillsData.software;
export const business = skillsData.business;
export const experience_items = experiencesData.items;

// Export headers
export const projectsHeader = projectsData.header;
export const experiencesHeader = experiencesData.header;