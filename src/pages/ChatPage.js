import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from 'react';
import { BiTrash, BiPlus, BiUser, BiSend, BiSolidUserCircle } from 'react-icons/bi';
import { MdOutlineArrowLeft, MdOutlineArrowRight } from 'react-icons/md';
import '../css/ChatPage.css';
import {
    Button, MenuItem, IconButton, Avatar, Menu
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

function ChatPage() {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [previousChats, setPreviousChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isResponseLoading, setIsResponseLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [isShowSidebar, setIsShowSidebar] = useState(false);
    const scrollToLastItem = useRef(null);
    const [user, setUser] = useState({
        avatar: '',
        name: '',
        email: '',
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

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

    // Fetch previous chats on mount
    useEffect(() => {
        const fetchChats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorText('User not authenticated.');
                return;
            }

            try {
                const response = await api.get('/chats');
                setPreviousChats(
                    Array.isArray(response.data.data) ? response.data.data.map(chat => ({
                        ...chat,
                        id: chat.id,
                    })) : []
                );
            } catch (error) {
                setErrorText('Failed to load chat history.');
                setPreviousChats([]);
            }
        };

        fetchChats();
    }, []);

    // Fetch messages for the selected chat
    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChatId) return;
    
            try {
                const response = await api.get(`/chats/${currentChatId}/messages`);
                if (response.data && response.data.data) {
                    const formattedMessages = response.data.data.map((msg) => {
                        if (msg.sender === 'assistant') {
                            // Apply `formatMessageContent` to each AI message
                            return { ...msg, content: formatMessageContent(msg.content) };
                        }
                        return msg;
                    });
                    setMessages(formattedMessages);
                } else {
                    setErrorText('No messages found.');
                }
            } catch (error) {
                setErrorText('Failed to load messages.');
                setMessages([]);
            }
        };
    
        fetchMessages();
    }, [currentChatId]);    

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const createNewChat = () => {
        setMessages([]);
        setText('');
        setCurrentChatId(null);
    };

    const backToHistoryPrompt = (chatId) => {
        setCurrentChatId(chatId);
        setText(''); // Clear the text input
    };

    const toggleSidebar = useCallback(() => {
        setIsShowSidebar((prev) => !prev);
    }, []);

    const submitHandler = useCallback(async (e) => {
        debugger;
        e.preventDefault();
        if (!text || isResponseLoading) return;
    
        setIsResponseLoading(true);
        setErrorText('');
        setIsTyping(true);
    
        try {
            let newChatId = currentChatId;
    
            if (!currentChatId) {
                const chatResponse = await api.post('/chats', { content: text });
                if (chatResponse.data && chatResponse.data.chat && chatResponse.data.chat.id) {
                    newChatId = chatResponse.data.chat.id;
                    setCurrentChatId(newChatId);
                    setPreviousChats((prev) => [
                        ...prev,
                        { id: newChatId, title: chatResponse.data.chat.title },
                    ]);
                } else {
                    setErrorText('Failed to create a new chat.');
                    return;
                }
            } else {
                await api.post(`/chats/${newChatId}/messages`, {
                    content: text,
                });
            }
    
            const response = await api.get(`/chats/${newChatId}/messages`);
            const formattedMessages = response.data.data.map((msg) => {
                if (msg.sender === 'assistant') {
                    // Apply `formatMessageContent` to each AI message
                    return { ...msg, content: formatMessageContent(msg.content) };
                }
                return msg;
            });
            setMessages(formattedMessages);
            setText('');
        } catch (error) {
            setErrorText('Failed to create chat or message.');
        } finally {
            setIsResponseLoading(false);
            setIsTyping(false);
        }
    }, [currentChatId, text, isResponseLoading]);    
    

    useLayoutEffect(() => {
        const handleResize = () => {
            setIsShowSidebar(window.innerWidth <= 640);
        };
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const deleteChat = async (chatId) => {
        if (!window.confirm('Are you sure you want to delete this chat?')) return;

        try {
            await api.delete(`/chats/${chatId}`);
            setPreviousChats(prev => prev.filter(chat => chat.id !== chatId)); // Update local state
            if (currentChatId === chatId) {
                setCurrentChatId(null); // Reset current chat if deleted
                setMessages([]); // Clear messages
            }
        } catch (error) {
            setErrorText('Failed to delete chat.');
        }
    };

    const formatMessageContent = (content) => {
        const colonIndex = content.indexOf(':');
        const mainText = content.substring(0, colonIndex + 1);
        const itemsText = content.substring(colonIndex + 1).trim();
        const items = itemsText.split(/[\n*]/).filter(item => item.trim());
        
        const numberedItems = items.map((item, index) => `${index + 1}. ${item.trim()}`).join('\n');
        return `${mainText}\n${numberedItems}`.replace(/\n/g, '<br />');
    };
    
    
    return (
        <div className='container chat-page'>
            <section className={`sidebar ${isShowSidebar ? 'open' : ''}`}>
                <div className='sidebar-header' onClick={createNewChat} role='button'>
                    <BiPlus size={20} />
                    <button>New Chat</button>
                </div>
                <div className='sidebar-history'>
                    {previousChats.length > 0 && (
                        <>
                            <p>Ongoing</p>
                            <ul>
                                {previousChats.map(chat => (
                                    <li key={chat.id}>
                                        <span onClick={() => backToHistoryPrompt(chat.id)}>
                                            {chat.title}
                                        </span>
                                        <IconButton
                                            aria-label='delete'
                                            onClick={() => deleteChat(chat.id)}
                                        >
                                            <BiTrash size={20} color='white' />
                                        </IconButton>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                <div className='sidebar-info'>
                    <div className='sidebar-info-user'>
                        {isLoggedIn ? (
                            <>
                                <IconButton onClick={handleAvatarClick}>
                                    <Avatar src={user.avatar} alt={user.name} />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleMenuClose}>Name: {user.name}</MenuItem>
                                    <MenuItem onClick={handleMenuClose}>Email: {user.email}</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button color="primary" variant="outlined" onClick={() => navigate('/')}>
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <section className='main'>
                {!currentChatId && (
                    <div className='empty-chat-container'>
                        <img
                            src='https://aitoga.com/wp-content/uploads/2024/03/Claude-AI-logo.png'
                            width={45}
                            height={45}
                            alt='ChatGPT'
                        />
                        <h1>AI Chat</h1>
                        <h3>How can I help you today?</h3>
                    </div>
                )}

                {isShowSidebar ? (
                    <MdOutlineArrowRight
                        className='burger'
                        size={28.8}
                        onClick={toggleSidebar}
                    />
                ) : (
                    <MdOutlineArrowLeft
                        className='burger'
                        size={28.8}
                        onClick={toggleSidebar}
                    />
                )}
                <div className="main-header">
                    <header className="chat-header">
                        {/* You can add a header or any title if needed */}
                    </header>
                    <div className="messages-container">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                                    <div className="message-wrapper">
                                        {msg.sender === 'user' ? (
                                            <BiSolidUserCircle size={28.8} />
                                        ) : (
                                            <img
                                                src="https://aitoga.com/wp-content/uploads/2024/03/Claude-AI-logo.png"
                                                alt="AI Logo"
                                                className="ai-avatar"
                                                width={35}
                                                height={35}
                                            />
                                        )}
                                        <div>
                                            <p className='role-title'>{msg.sender === 'user' ? 'You' : 'AI chat'}</p>
                                            <p dangerouslySetInnerHTML={{ __html: msg.content }}></p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No messages yet.</p>
                        )}
                        {/* Show typing indicator */}
                        {isTyping && (
                            <div className="message ai-message">
                                <div className="message-wrapper">
                                    <img
                                        src="https://aitoga.com/wp-content/uploads/2024/03/Claude-AI-logo.png"
                                        alt="AI Logo"
                                        className="ai-avatar"
                                        width={35}
                                        height={35}
                                    />
                                    <div>
                                        <p className='role-title'>AI chat</p>
                                        <p className="typing-indicator">Typing...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollToLastItem} />
                    </div>
                </div>

                <div className='main-bottom'>
                        {errorText && <p className='errorText'>{errorText}</p>}
                        {errorText && (
                            <p id='errorTextHint'>
                                *Nothing Just error.
                            </p>
                        )}
                        
                        <form className='form-container' onSubmit={submitHandler}>
                            <input
                                type='text'
                                placeholder='Send a message.'
                                spellCheck='false'
                                value={isResponseLoading ? 'Processing...' : text}
                                onChange={(e) => setText(e.target.value)}
                                readOnly={isResponseLoading}
                            />
                            <button type='submit' disabled={isResponseLoading}>
                                <BiSend size={20} />
                            </button>
                        </form>
                        <p>
                            Chat can make mistakes. Consider checking important
                            information.
                        </p>
                </div>
            </section>
        </div>
    );
}

export default ChatPage;
