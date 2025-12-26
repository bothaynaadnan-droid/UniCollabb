import { api } from './client';

export async function listSupervisors(params = {}) {
  const res = await api.get('/api/supervisor', { params });
  return res?.data?.data || [];
}

export async function getSupervisorById(id) {
  if (!id) throw new Error('id is required');
  const res = await api.get(`/api/supervisor/${id}`);
  return res?.data?.data;
}
