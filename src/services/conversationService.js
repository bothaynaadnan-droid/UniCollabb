import api from '../api/api';

const ConversationService = {
  addParticipant: (conversationId, payload) => api.post(`/conversation/${conversationId}/participants`, payload),
  removeParticipant: (conversationId, userId) => api.delete(`/conversation/${conversationId}/participants/${userId}`),
  // optional helper to list participants if backend provides it
  getParticipants: (conversationId) => api.get(`/conversation/${conversationId}/participants`),
};

export default ConversationService;
