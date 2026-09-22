import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/context/useAuth';
import { getDmMessages, sendDmMessage } from '@/apis/dms';

export const MemberProfile = () => {
    const { workspaceId, memberId } = useParams();
    const { token, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    const loadMessages = async () => {
        try {
            const res = await getDmMessages({ workspaceId, memberId, token });
            setMessages(res.data || []);
        } catch (err) {
            console.error('Failed to load DM messages', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 4000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId, memberId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        try {
            await sendDmMessage({ workspaceId, memberId, body: draft, token });
            setDraft('');
            loadMessages();
        } catch (err) {
            console.error('Failed to send DM', err);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading && <p className="text-white/40 text-sm">Loading conversation...</p>}
                {!loading && messages.length === 0 && (
                    <p className="text-white/40 text-sm">No messages yet. Say hi 👋</p>
                )}
                {messages.map((m) => {
                    const isMine = m.senderId === user?._id || m.senderId?._id === user?._id;
                    return (
                        <div
                            key={m._id}
                            className={`max-w-md px-3 py-2 rounded-lg text-sm ${
                                isMine ? 'bg-sky-600 text-white ml-auto' : 'bg-white/10 text-white/90'
                            }`}
                        >
                            {m.body}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-white/10 text-white text-sm rounded-md px-3 py-2 outline-none placeholder:text-white/40"
                />
                <button
                    type="submit"
                    className="bg-sky-600 text-white text-sm px-4 py-2 rounded-md hover:bg-sky-700"
                >
                    Send
                </button>
            </form>
        </div>
    );
};
