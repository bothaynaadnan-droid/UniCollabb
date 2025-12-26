import { api } from './client';

export async function createJoinRequest({ projectId, desiredRole, message }) {
  if (!projectId) throw new Error('projectId is required');
  const res = await api.post('/api/join-request', {
    project_id: projectId,
    desired_role: desiredRole || null,
    message: message || null
  });
  return res?.data;
}

export async function listJoinRequestInbox() {
  const res = await api.get('/api/join-request/inbox');
  return res?.data?.data || [];
}

export async function listJoinRequestsByProject(projectId) {
  if (!projectId) throw new Error('projectId is required');
  const res = await api.get(`/api/join-request/project/${projectId}`);
  return res?.data?.data || [];
}

export async function updateJoinRequestStatus(id, status) {
  if (!id) throw new Error('id is required');
  const res = await api.patch(`/api/join-request/${id}/status`, { status });
  return res?.data;
}
