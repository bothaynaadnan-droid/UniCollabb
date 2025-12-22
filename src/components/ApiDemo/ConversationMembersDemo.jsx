import React, { useState } from 'react';
import { useConversationMembers } from '../../hooks/useConversationMembers';

export default function ConversationMembersDemo({ conversationId = 1 }) {
  const { members, loading, error, addMember, removeMember, fetch } = useConversationMembers(conversationId);
  const [name, setName] = useState('New Member');

  return (
    <div style={{ padding: 12, background: '#fff', color: '#000' }}>
      <h3>Conversation Members Demo (conversation {conversationId})</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{JSON.stringify(error)}</div>}
      <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
        {members && members.length ? members.map(m => (
          <div key={m.id} style={{ padding: 6, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <div>{m.userName || m.userId}</div>
            <div>
              <button onClick={async () => { await removeMember(m.id); }}>Remove</button>
            </div>
          </div>
        )) : <div>No members</div>}
      </div>

      <div style={{ marginTop: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Member name" />
        <button onClick={async () => { await addMember({ conversationId, userName: name }); setName(''); }}>Add</button>
        <button onClick={fetch}>Refresh</button>
      </div>
    </div>
  );
}
