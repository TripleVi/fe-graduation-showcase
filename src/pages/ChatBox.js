import React, { useState } from "react";
import '../css/ChatBox.css';
import { BiMessageRoundedDots } from 'react-icons/bi';
import ChatPage from './ChatPage';

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);

    const handleChatBoxClick = () => {
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
                <ChatPage onClose={() => setIsOpen(false)} />
            </div>
        </>
    );
}
