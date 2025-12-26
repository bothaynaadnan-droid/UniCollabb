import { api } from './client';

const BUCKETS = Object.freeze({
  drafts: 'drafts',
  tasks: 'tasks',
  whiteboard: 'whiteboard',
  events: 'events'
});

export function getPlannerBuckets() {
  return BUCKETS;
}

export async function getPlannerBucket(bucket) {
  const b = String(bucket || '').toLowerCase();
  const res = await api.get(`/api/planner/${b}`);
  return res?.data?.data;
}

export async function savePlannerBucket(bucket, data) {
  const b = String(bucket || '').toLowerCase();
  const res = await api.put(`/api/planner/${b}`, { data });
  return res?.data;
}
