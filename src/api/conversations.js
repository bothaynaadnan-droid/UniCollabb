import { api } from './client';

export async function listMyConversations(userId) {
  if (!userId) throw new Error('userId is required');
  const res = await api.get(`/api/conversation/user/${userId}`);
  return res?.data?.data || [];
}

export async function getConversation(conversationId) {
  const res = await api.get(`/api/conversation/${conversationId}`);
  return res?.data?.data;
}

export async function createConversation(payload) {
  const res = await api.post('/api/conversation', payload);
  return res?.data?.data;
}

export async function listMessages(conversationId, params = {}) {
  const res = await api.get(`/api/message/conversation/${conversationId}`, { params });
  return {
    messages: res?.data?.data || [],
    unreadCount: res?.data?.unreadCount || 0
  };
}

export async function sendMessage(payload) {
  const res = await api.post('/api/message', payload);
  return res?.data?.data;
}
