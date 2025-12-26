import { api } from './client';

export function parseProjectRequirements(requirements) {
  if (!requirements) return null;
  if (typeof requirements === 'object') return requirements;

  try {
    return JSON.parse(requirements);
  } catch (e) {
    return null;
  }
}

export function buildProjectRequirements({ field, requiredSkills, maxTeamSize, lookingForTeam, supervisorName }) {
  return JSON.stringify({
    field: field || 'Other',
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    maxTeamSize: typeof maxTeamSize === 'number' ? maxTeamSize : 4,
    lookingForTeam: typeof lookingForTeam === 'boolean' ? lookingForTeam : true,
    supervisorName: supervisorName || ''
  });
}

export async function listProjects(params = {}) {
  const res = await api.get('/api/project', { params });
  return res?.data?.data || [];
}

export async function getProjectById(id) {
  const res = await api.get(`/api/project/${id}`);
  return res?.data?.data;
}

export async function createProject(payload) {
  const res = await api.post('/api/project', payload);
  return res?.data;
}

export async function listProjectsByCreator(creatorId) {
  if (!creatorId) throw new Error('creatorId is required');
  const res = await api.get(`/api/project/creator/${creatorId}`);
  return res?.data?.data || [];
}

export async function listProjectsBySupervisor(supervisorId) {
  if (!supervisorId) throw new Error('supervisorId is required');
  const res = await api.get(`/api/project/supervisor/${supervisorId}`);
  return res?.data?.data || [];
}

export function mapApiProjectToUi(apiProject) {
  const req = parseProjectRequirements(apiProject?.requirements);

  const field = req?.field || 'Other';
  const skills = Array.isArray(req?.requiredSkills) ? req.requiredSkills : [];
  const maxTeamSize = typeof req?.maxTeamSize === 'number' ? req.maxTeamSize : 4;
  const lookingForTeam = typeof req?.lookingForTeam === 'boolean' ? req.lookingForTeam : true;
  const supervisorName = req?.supervisorName || apiProject?.supervisor_name || 'Not assigned';

  return {
    id: apiProject?.id,
    creatorId: apiProject?.creator_id,
    supervisorId: apiProject?.supervisor_id,
    title: apiProject?.title || '',
    description: apiProject?.description || '',
    detailedDescription: apiProject?.description || '',

    field,
    skills,
    tools: skills,
    tags: [field],

    status: apiProject?.status || 'planning',
    progress: 0,
    rating: 0,

    teamMembers: 1,
    maxTeamSize,
    lookingForTeam,

    supervisorName,
    supervisor: {
      name: supervisorName,
      university: '',
      department: '',
      email: ''
    },

    githubLink: '',
    documentation: '',
    createdAt: apiProject?.created_at ? String(apiProject.created_at).slice(0, 10) : ''
  };
}
