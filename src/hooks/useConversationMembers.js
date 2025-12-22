import { useState, useEffect, useCallback } from 'react';
import ConversationMemberService from '../services/conversationMemberService';

export function useConversationMembers(conversationId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ConversationMemberService.getByConversation(conversationId);
      setMembers(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addMember = async (payload) => {
    const res = await ConversationMemberService.create(payload);
    await fetch();
    return res;
  };

  const removeMember = async (id) => {
    const res = await ConversationMemberService.remove(id);
    await fetch();
    return res;
  };

  return { members, loading, error, fetch, addMember, removeMember };
}
