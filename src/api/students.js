import { api } from './client';

export async function listStudents(params = {}) {
  const res = await api.get('/api/student', { params });
  return res?.data?.data || [];
}

export async function getStudentById(id) {
  if (!id) throw new Error('id is required');
  const res = await api.get(`/api/student/${id}`);
  return res?.data?.data;
}
