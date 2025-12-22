import { useState, useEffect, useCallback } from 'react';
import MessageService from '../services/messageService';

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MessageService.getByConversation(conversationId);
      setMessages(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    fetch();
  }, [conversationId, fetch]);

  const sendMessage = async (payload) => {
    const res = await MessageService.create(payload);
    // optimistic: refetch
    await fetch();
    return res;
  };

  const markRead = async (id) => {
    await MessageService.markRead(id);
    await fetch();
  };

  return { messages, loading, error, fetch, sendMessage, markRead };
}
