import { api } from './client';

export async function createSupervisorRequest({ projectId, supervisorId, message }) {
  if (!projectId) throw new Error('projectId is required');
  if (!supervisorId) throw new Error('supervisorId is required');
  const res = await api.post('/api/supervisor-request', {
    project_id: projectId,
    supervisor_id: supervisorId,
    message: message || null
  });
  return res?.data;
}

export async function listSupervisorRequestInbox() {
  const res = await api.get('/api/supervisor-request/inbox');
  return res?.data?.data || [];
}

export async function updateSupervisorRequestStatus(id, status) {
  if (!id) throw new Error('id is required');
  const res = await api.patch(`/api/supervisor-request/${id}/status`, { status });
  return res?.data;
}
