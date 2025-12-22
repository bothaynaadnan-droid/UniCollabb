import { useState, useEffect, useCallback } from 'react';
import ConversationService from '../services/conversationService';

export function useConversationParticipants(conversationId) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      // if backend exposes participants listing via conversation/:id/participants
      const data = await ConversationService.getParticipants(conversationId).catch(() => null);
      setParticipants(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Note: ConversationService currently exposes add/remove participant endpoints only (per deliverable). If you have a participants-list endpoint add it to the service.
  useEffect(() => { fetch(); }, [fetch]);

  const addParticipant = async (payload) => {
    const res = await ConversationService.addParticipant(conversationId, payload);
    await fetch();
    return res;
  };

  const removeParticipant = async (userId) => {
    const res = await ConversationService.removeParticipant(conversationId, userId);
    await fetch();
    return res;
  };

  return { participants, loading, error, fetch, addParticipant, removeParticipant };
}
