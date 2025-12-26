import { api } from './client';

export async function getMembersByProject(projectId) {
  if (!projectId) throw new Error('projectId is required');
  const res = await api.get(`/api/project-member/project/${projectId}`);
  return {
    members: res?.data?.data || [],
    count: res?.data?.count ?? (res?.data?.data?.length || 0)
  };
}

export async function addProjectMember({ projectId, studentId, role = 'member' }) {
  if (!projectId || !studentId) throw new Error('projectId and studentId are required');
  const res = await api.post('/api/project-member', {
    project_id: projectId,
    student_id: studentId,
    role
  });
  return res?.data;
}

export async function removeProjectMember({ projectId, studentId }) {
  if (!projectId || !studentId) throw new Error('projectId and studentId are required');
  const res = await api.delete(`/api/project-member/project/${projectId}/student/${studentId}`);
  return res?.data;
}

export async function isProjectMember({ projectId, studentId }) {
  if (!projectId || !studentId) throw new Error('projectId and studentId are required');
  const res = await api.get(`/api/project-member/project/${projectId}/student/${studentId}/status`);
  return !!res?.data?.isMember;
}
