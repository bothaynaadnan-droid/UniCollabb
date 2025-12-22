import React, { useState } from 'react';
import ConversationService from '../../services/conversationService';

export default function ConversationsDemo({ conversationId = 1 }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const addParticipant = async () => {
    setLoading(true);
    try {
      const res = await ConversationService.addParticipant(conversationId, { userId: 123, role: 'member' });
      setStatus(res);
    } catch (e) {
      setStatus(e);
    } finally { setLoading(false); }
  };

  const removeParticipant = async () => {
    setLoading(true);
    try {
      const res = await ConversationService.removeParticipant(conversationId, 123);
      setStatus(res);
    } catch (e) {
      setStatus(e);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 12, background: '#fff', color: '#000' }}>
      <h3>Conversations Demo (conversation {conversationId})</h3>
      <div>
        <button onClick={addParticipant} disabled={loading}>Add participant (userId=123)</button>
        <button onClick={removeParticipant} disabled={loading}>Remove participant (userId=123)</button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
