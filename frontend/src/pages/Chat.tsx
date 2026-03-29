import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  senderName: string;
  sender: string;
  text: string;
  createdAt: string;
}

let socket: Socket;

export default function Chat() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    // Load existing messages
    api.get(`/messages/${bookingId}`).then(r => setMessages(r.data)).catch(() => {});

    // Connect socket
    socket = io('http://localhost:5000');
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_booking', bookingId);
    });
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socket.disconnect(); };
  }, [bookingId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !connected) return;
    const token = localStorage.getItem('supert_token') || '';
    socket.emit('send_message', { bookingId, token, text: text.trim() });
    setText('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1a3fa8', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Booking Chat</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{connected ? '● Online' : '○ Connecting...'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f0f4ff', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: '0.9rem' }}>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender === user?.id;
          return (
            <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <span style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 2, paddingLeft: 4 }}>{msg.senderName}</span>}
              <div style={{
                background: isMe ? '#1a3fa8' : '#fff',
                color: isMe ? '#fff' : '#111',
                padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                maxWidth: '75%',
                fontSize: '0.92rem',
                lineHeight: 1.4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, paddingRight: isMe ? 4 : 0, paddingLeft: isMe ? 0 : 4 }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
        />
        <button type="submit" disabled={!text.trim() || !connected} style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a3fa8', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
