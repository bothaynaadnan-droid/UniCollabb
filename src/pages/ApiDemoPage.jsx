import React from 'react';
import ConversationsDemo from '../components/ApiDemo/ConversationsDemo';
import MessagesDemo from '../components/ApiDemo/MessagesDemo';
import ConversationMembersDemo from '../components/ApiDemo/ConversationMembersDemo';

export default function ApiDemoPage() {
  const conversationId = 1;
  return (
    <div style={{ padding: 20 }}>
      <h2>API Demo Page</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <ConversationsDemo conversationId={conversationId} />
        <ConversationMembersDemo conversationId={conversationId} />
        <MessagesDemo conversationId={conversationId} />
      </div>
    </div>
  );
}
