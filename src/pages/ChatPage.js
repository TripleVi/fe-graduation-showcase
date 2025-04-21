import { useState, useEffect,useRef,useCallback,} from 'react';
import { BiTrash, BiPlus, BiSend, BiSolidUserCircle, BiX, BiMenu,BiHistory
} from 'react-icons/bi';
import '../css/ChatPage.css';
import {
    IconButton, 
    Avatar
} from '@mui/material';
import axios from 'axios';
import avatar from '../img/DALL·E 2024-11-19 05.35.3.png';

const api = axios.create({
    baseURL: 'https://graduationshowcase.onrender.com/api/v1',
    
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
    const [previousChats, setPreviousChats] = useState([]);
    const scrollToLastItem = useRef(null);
    const [user, setUser] = useState({
        avatar: '',
        name: '',
        email: '',
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({
                avatar: localStorage.getItem('avatar'),
                name: localStorage.getItem('name'),
                email: localStorage.getItem('email'),
            });
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

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

    const groupMessagesByPair = (messages) => {
        // Sắp xếp tin nhắn theo id tăng dần
        const sortedMessages = [...messages].sort((a, b) => a.id - b.id);
        const pairedMessages = [];
    
        // Ghép cặp các tin nhắn user - assistant
        for (let i = 0; i < sortedMessages.length; i += 2) {
            const userMessage = sortedMessages[i];
            const assistantMessage = sortedMessages[i + 1];
            if (userMessage && assistantMessage) {
                pairedMessages.push(userMessage, assistantMessage);
            } else {
                // Nếu không có tin nhắn ghép cặp (trường hợp lẻ), thêm vào cuối
                pairedMessages.push(userMessage || assistantMessage);
            }
        }
    
        return pairedMessages;
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
            let newChatId = currentChatId;
    
            // Tạo chat mới nếu chưa có chat
            if (!currentChatId) {
                const response = await fetch('https://graduationshowcase.onrender.com/api/v1/chats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ content: text }),
                });
    
                if (!response.body) {
                    throw new Error('Response body is null');
                }
    
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let chunkData = ''; // Lưu trữ toàn bộ chunk
    
                // Thêm tin nhắn của user ngay lập tức
                const userMessage = {
                    sender: 'user',
                    content: text,
                    id: Date.now(),
                };
                setMessages((prev) => [...prev, userMessage]);
    
                // Xử lý từng chunk
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    // Giải mã chunk
                    const chunk = decoder.decode(value, { stream: true });
                    chunkData += chunk;
                }
    
                // Sau khi nhận xong toàn bộ chunk, thêm hiệu ứng gõ
                await simulateTypingEffect(chunkData);
    
                // Sau khi typing effect hoàn tất, cập nhật chat ID (nếu có)
                const idMatch = chunkData.match(/"id":\s*(\d+)/);
                if (idMatch) {
                    newChatId = parseInt(idMatch[1], 10);
                    setCurrentChatId(newChatId);
    
                    setChatHistory((prev) => [
                        { id: newChatId, title: 'Untitled' },
                        ...prev,
                    ]);
                } else {
                    setErrorText('Failed to extract chat ID from response.');
                    return;
                }
            } else {
                // Gửi tin nhắn vào chat hiện tại
                const response = await fetch(`https://graduationshowcase.onrender.com/api/v1/chats/${newChatId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ content: text }),
                });
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let chunkData = ''; // Lưu trữ toàn bộ chunk
                // Thêm tin nhắn của user ngay lập tức
                const userMessage = {
                    sender: 'user',
                    content: text,
                    id: Date.now(),
                };
                setMessages((prev) => [...prev, userMessage]);
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    // Giải mã chunk
                    const chunk = decoder.decode(value, { stream: true });
                    chunkData += chunk;
                }
    
                // Sau khi nhận xong toàn bộ chunk, thêm hiệu ứng gõ
                await simulateTypingEffect(chunkData);
            }
    
            setText('');
        } catch (error) {
            setErrorText('Failed to send message.');
        } finally {
            setIsResponseLoading(false);
            setIsTyping(false);
        }
    }, [currentChatId, text, isResponseLoading]);
    
    
    const simulateTypingEffect = async (responseText) => {
        return new Promise((resolve) => {
            // Lọc bỏ các phần dữ liệu JSON không mong muốn trong `responseText`
            // Giả sử phần văn bản bạn cần là phần đầu tiên xuất hiện
            const cleanedText = responseText.match(/^[^{}]+/)?.[0] || responseText; 
    
            let index = 0;
    
            // Thêm tin nhắn "assistant" trống để bắt đầu typing
            setMessages((prev) => [...prev, { sender: 'assistant', content: '' }]);
    
            const intervalId = setInterval(() => {
                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    const currentMessage = updatedMessages[updatedMessages.length - 1];
                    //console.log(currentMessage);
                    // Đảm bảo tin nhắn cuối cùng là của "assistant"
                    if (currentMessage.sender === 'assistant') {
                        currentMessage.content = cleanedText.slice(0, index); // Hiển thị dần nội dung
                    }
    
                    return updatedMessages;
                });
    
                index++;
    
                // Kết thúc khi toàn bộ văn bản đã được gõ
                if (index > cleanedText.length) {
                    clearInterval(intervalId);
                    resolve(); // Kết thúc promise sau khi hoàn tất
                }
            }, 100); // Tốc độ typing (50ms mỗi ký tự)
        });
    };
    
    
    

    useEffect(() => {
        if (scrollToLastItem.current) {
            scrollToLastItem.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (isSidebarOpen && chatHistory.length > 0) {
            // Scroll sidebar đến chat mới nhất
            document.querySelector('.chat-history').scrollTop = 0;
        }
    }, [chatHistory, isSidebarOpen]);
    
    

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
                        groupMessagesByPair(messages).map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                <div className="message-wrapper">
                                    {msg.sender === 'user' ? (
                                        <Avatar 
                                            src={user.avatar || undefined} 
                                            alt="User Avatar"
                                            sx={{ width: 28, height: 28 }}
                                        >
                                            {!user.avatar && <BiSolidUserCircle size={20} />}
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