import React, { useState, useEffect } from "react";
import '../css/ChatBox.css';
import { BiMessageRoundedDots } from 'react-icons/bi';
import ChatPage from './ChatPage';

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if the user is logged in when the component mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // Set isLoggedIn based on token presence
    }, []);

    const handleChatBoxClick = () => {
        if (!isLoggedIn) {
            alert('You need to log in to use the chat.');
            return;
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div 
                className="chat-box" 
                onClick={handleChatBoxClick}
                aria-label="Open chat"
            >
                <BiMessageRoundedDots className="chat-box-icon" />
            </div>
            
            <div className={`chat-page ${!isOpen ? 'hidden' : ''}`}>
                {isLoggedIn ? (
                    <ChatPage onClose={() => setIsOpen(false)} />
                ) : (
                    <div className="login-prompt">
                        <p>You need to log in to use the chat.</p>
                    </div>
                )}
            </div>
        </>
    );
}
