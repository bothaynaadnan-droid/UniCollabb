import api from '../api/api';

const ConversationMemberService = {
  list: () => api.get('/conversation-member'),
  create: (payload) => api.post('/conversation-member', payload),
  get: (id) => api.get(`/conversation-member/${id}`),
  remove: (id) => api.delete(`/conversation-member/${id}`),
  getByUser: (userId) => api.get(`/conversation-member/user/${userId}`),
  getByConversation: (conversationId) => api.get(`/conversation-member/conversation/${conversationId}`),
  getAdminsInConversation: (conversationId) => api.get(`/conversation-member/conversation/${conversationId}/admins`),
  patchRole: (id, payload) => api.patch(`/conversation-member/${id}/role`, payload),
  leave: (id) => api.patch(`/conversation-member/${id}/leave`),
  leaveByUser: (conversationId, userId) => api.patch(`/conversation-member/conversation/${conversationId}/user/${userId}/leave`),
  deleteByConversationUser: (conversationId, userId) => api.delete(`/conversation-member/conversation/${conversationId}/user/${userId}`),
  getStatus: (conversationId, userId) => api.get(`/conversation-member/conversation/${conversationId}/user/${userId}/status`),
};

export default ConversationMemberService;
