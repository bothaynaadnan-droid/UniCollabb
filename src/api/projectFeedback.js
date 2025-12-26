import { api } from './client';

export async function listFeedbackByProject(projectId, { status } = {}) {
  if (!projectId) throw new Error('projectId is required');
  const res = await api.get(`/api/project-feedback/project/${projectId}`, {
    params: status ? { status } : undefined
  });
  return {
    feedbacks: res?.data?.data || [],
    averageRating: Number(res?.data?.averageRating || 0),
    count: res?.data?.count ?? (res?.data?.data?.length || 0)
  };
}

export async function listFeedbackBySupervisor(supervisorId, { status } = {}) {
  if (!supervisorId) throw new Error('supervisorId is required');
  const res = await api.get(`/api/project-feedback/supervisor/${supervisorId}`, {
    params: status ? { status } : undefined
  });
  return {
    feedbacks: res?.data?.data || [],
    stats: res?.data?.stats || [],
    count: res?.data?.count ?? (res?.data?.data?.length || 0)
  };
}

export async function createFeedback({ projectId, supervisorId, comments, rating, status = 'published' }) {
  if (!projectId || !supervisorId) throw new Error('projectId and supervisorId are required');
  const res = await api.post('/api/project-feedback', {
    project_id: projectId,
    supervisor_id: supervisorId,
    comments,
    rating,
    status
  });
  return res?.data;
}

export async function updateFeedback(feedbackId, { comments, rating, status }) {
  if (!feedbackId) throw new Error('feedbackId is required');
  const res = await api.put(`/api/project-feedback/${feedbackId}`, {
    comments,
    rating,
    status
  });
  return res?.data;
}

export async function updateFeedbackStatus(feedbackId, status) {
  if (!feedbackId) throw new Error('feedbackId is required');
  const res = await api.patch(`/api/project-feedback/${feedbackId}/status`, { status });
  return res?.data;
}
