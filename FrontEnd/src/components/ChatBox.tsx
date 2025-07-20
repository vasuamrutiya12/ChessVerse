import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface ChatMessage {
    from: string;
    message: string;
    timestamp: string;
    gameId: string;
}

interface ChatBoxProps {
    socket: WebSocket | null;
    gameId: string | null;
    currentUserEmail: string;
    isGameActive: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ socket, gameId, currentUserEmail, isGameActive }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message') {
                setMessages(prev => [...prev, data.payload]);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket]);

    const sendMessage = () => {
        if (!socket || !newMessage.trim() || !gameId) return;

        console.log('Sending chat message:', { 
            message: newMessage.trim(), 
            gameId, 
            from: currentUserEmail 
        });
        
        socket.send(JSON.stringify({
            type: 'chat_message',
            payload: {
                message: newMessage.trim(),
                gameId: gameId,
                from: currentUserEmail,
                timestamp: new Date().toISOString()
            }
        }));

        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isGameActive) return null;

    return (
        <div className={`fixed bottom-4 right-4 bg-slate-800 rounded-lg border border-slate-700 shadow-2xl transition-all duration-300 ${
            isExpanded ? 'w-80 h-96' : 'w-80 h-12'
        }`}>
            {/* Header */}
            <div 
                className="flex items-center justify-between p-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Game Chat</span>
                    {messages.length > 0 && !isExpanded && (
                        <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-1">
                            {messages.length}
                        </span>
                    )}
                </div>
                <div className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Chat Content */}
            {isExpanded && (
                <>
                    {/* Messages */}
                    <div className="flex-1 p-3 h-64 overflow-y-auto space-y-2">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">
                                <div className="text-2xl mb-2">💬</div>
                                <div>No messages yet</div>
                                <div className="text-xs">Start a conversation with your opponent!</div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.from === currentUserEmail ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                        msg.from === currentUserEmail 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-slate-700 text-slate-200'
                                    }`}>
                                        <div className="font-medium text-xs opacity-75 mb-1">
                                            {msg.from === currentUserEmail ? 'You' : msg.from}
                                        </div>
                                        <div>{msg.message}</div>
                                        <div className="text-xs opacity-50 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-700">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                maxLength={200}
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                size="sm"
                                className="px-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </Button>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            {newMessage.length}/200 characters
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};