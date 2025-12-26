import { api } from './client';

// The backend models use separate tables for student/supervisor.
// These helpers resolve the "actor" id (students.id / supervisors.id) from a logged-in user id.

export async function getStudentByUserId(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await api.get(`/api/student/user/${userId}`);
  return res?.data?.data;
}

export async function getSupervisorByUserId(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await api.get(`/api/supervisor/user/${userId}`);
  return res?.data?.data;
}

export async function resolveActorIdForUser(user) {
  if (!user?.id || !user?.role) return {};

  if (user.role === 'student') {
    const student = await getStudentByUserId(user.id);
    return { studentId: student?.id };
  }

  if (user.role === 'supervisor') {
    const supervisor = await getSupervisorByUserId(user.id);
    return { supervisorId: supervisor?.id };
  }

  return {};
}
