import api from '../api/api';

const MessageService = {
  list: () => api.get('/message'),
  create: (payload) => api.post('/message', payload),
  getByConversation: (conversationId) => api.get(`/message/conversation/${conversationId}`),
  searchInConversation: (conversationId, params) => api.get(`/message/conversation/${conversationId}/search`, { params }),
  getBySender: (senderId) => api.get(`/message/sender/${senderId}`),
  get: (id) => api.get(`/message/${id}`),
  update: (id, payload) => api.put(`/message/${id}`, payload),
  remove: (id) => api.delete(`/message/${id}`),
  markRead: (id) => api.patch(`/message/${id}/read`),
  markConversationRead: (conversationId) => api.patch(`/message/conversation/${conversationId}/read`),
};

export default MessageService;
