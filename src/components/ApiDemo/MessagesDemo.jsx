import React, { useState } from 'react';
import { useMessages } from '../../hooks/useMessages';

export default function MessagesDemo({ conversationId = 1 }) {
  const { messages, loading, error, sendMessage, fetch } = useMessages(conversationId);
  const [text, setText] = useState('');

  return (
    <div style={{ padding: 12, background: '#fff', color: '#000' }}>
      <h3>Messages Demo (conversation {conversationId})</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{JSON.stringify(error)}</div>}
      <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
        {messages && messages.length ? messages.map(m => (
          <div key={m.id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>
            <strong>{m.senderName || m.senderId}</strong>: {m.content || m.message || JSON.stringify(m)}
          </div>
        )) : <div>No messages</div>}
      </div>

      <div style={{ marginTop: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Message text" />
        <button onClick={async () => { if (!text) return; await sendMessage({ conversationId, content: text }); setText(''); }}>Send</button>
        <button onClick={fetch}>Refresh</button>
      </div>
    </div>
  );
}
