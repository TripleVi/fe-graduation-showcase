import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import { 
    BiTrash, 
    BiPlus, 
    BiSend, 
    BiSolidUserCircle, 
    BiX,
    BiMenu,
    BiHistory
} from 'react-icons/bi';
import '../css/ChatPage.css';
import {
    IconButton, 
    Avatar
} from '@mui/material';
import axios from 'axios';
import avatar from '../img/DALL·E 2024-11-19 05.35.3.png';

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

function ChatPage({ onClose }) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isResponseLoading, setIsResponseLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const scrollToLastItem = useRef(null);

    useEffect(() => {
        // Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const response = await api.get('/chats');
                setChatHistory(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            }
        };
        fetchChatHistory();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const createNewChat = () => {
        setMessages([]);
        setCurrentChatId(null);
        setText('');
    };

    const loadChatHistory = async (chatId) => {
        try {
            const response = await api.get(`/chats/${chatId}/messages`);
            setMessages(response.data.data || []);
            setCurrentChatId(chatId);
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const deleteChat = async (chatId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                await api.delete(`/chats/${chatId}`);
                setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
                if (currentChatId === chatId) {
                    setMessages([]);
                    setCurrentChatId(null);
                }
            } catch (error) {
                console.error('Failed to delete chat:', error);
            }
        }
    };

    const submitHandler = useCallback(async (e) => {
        e.preventDefault();
        if (!text || isResponseLoading) return;
    
        setIsResponseLoading(true);
        setErrorText('');
        setIsTyping(true);
    
        try {
            // Add user message immediately
            const userMessage = {
                sender: 'user',
                content: text,
                id: Date.now()
            };
            setMessages(prev => [...prev, userMessage]);
            
            // Simulate AI response (replace with your actual API call)
            setTimeout(() => {
                const aiMessage = {
                    sender: 'assistant',
                    content: 'This is a sample response. Replace with actual API integration.',
                    id: Date.now() + 1
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsResponseLoading(false);
                setIsTyping(false);
            }, 1000);
            
            setText('');
        } catch (error) {
            setErrorText('Failed to send message.');
            setIsResponseLoading(false);
            setIsTyping(false);
        }
    }, [text, isResponseLoading]);

    useEffect(() => {
        if (scrollToLastItem.current) {
            scrollToLastItem.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="chat-container">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <BiMenu size={24} />
            </button>

            <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="chat-history">
                    <h4>Chat History</h4>
                    <div 
                        className="history-item" 
                        onClick={createNewChat}
                        style={{ backgroundColor: '#3a3b3c' }}
                    >
                        <span><BiPlus size={16} style={{ marginRight: '8px' }} />New Chat</span>
                    </div>
                    {chatHistory.map((chat) => (
                        <div 
                            key={chat.id} 
                            className="history-item"
                            onClick={() => loadChatHistory(chat.id)}
                        >
                            <span><BiHistory size={16} style={{ marginRight: '8px' }} />{chat.title}</span>
                            <IconButton
                                size="small"
                                onClick={(e) => deleteChat(chat.id, e)}
                                style={{ color: '#e4e6eb' }}
                            >
                                <BiTrash size={16} />
                            </IconButton>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-content">
                <div className="chat-header">
                    <h3>Chat</h3>
                    <IconButton onClick={onClose} size="small" style={{ color: '#e4e6eb' }}>
                        <BiX size={24} />
                    </IconButton>
                </div>

                <div className="messages-container">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                <div className="message-wrapper">
                                    {msg.sender === 'user' ? (
                                        <Avatar sx={{ width: 28, height: 28 }}>
                                            <BiSolidUserCircle size={20} />
                                        </Avatar>
                                    ) : (
                                        <Avatar 
                                            src={avatar}
                                            alt="AI Logo"
                                            className="ai-avatar"
                                            sx={{ width: 28, height: 28 }}
                                        />
                                    )}
                                    <div className="message-content">
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='empty-chat-container'>
                            <Avatar 
                                src={avatar}
                                alt="AI Logo"
                                sx={{ width: 60, height: 60, mb: 2 }}
                            />
                            <h1>Welcome to AI Chat</h1>
                            <p>Start a conversation by typing a message below</p>
                        </div>
                    )}
                    {isTyping && (
                        <div className="message ai-message">
                            <div className="message-wrapper">
                                <Avatar 
                                    src={avatar}
                                    alt="AI Logo"
                                    className="ai-avatar"
                                    sx={{ width: 28, height: 28 }}
                                />
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollToLastItem} />
                </div>

                <div className='main-bottom'>
                    {errorText && <p className='errorText'>{errorText}</p>}
                    <form className='form-container' onSubmit={submitHandler}>
                        <input
                            type='text'
                            placeholder='Send a message...'
                            spellCheck='false'
                            value={isResponseLoading ? 'Processing...' : text}
                            onChange={(e) => setText(e.target.value)}
                            readOnly={isResponseLoading}
                        />
                        <button type='submit' disabled={isResponseLoading}>
                            <BiSend size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
