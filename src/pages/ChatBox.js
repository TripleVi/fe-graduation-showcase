import React, { useContext } from "react";
import '../css/ChatBox.css';
import { Fade } from "react-reveal";
import StyleContext from "../contexts/StyleContext"; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import { BiChat } from 'react-icons/bi'; // Import an icon for the chat box

export default function ChatBox() {
    const { isDark } = useContext(StyleContext);

    const podcastSection = {
        title: "Chat Box",
        subtitle: "AI helps optimize search and research, and answer project questions.",
        display: true // Set false to hide this section, defaults to true
    };

    const navigate = useNavigate(); // Initialize navigate for navigation

    // Function to handle chat box click
    const handleChatBoxClick = () => {
        navigate('/chat'); // Use navigate to go to the chat page
    };

    return (
        <Fade bottom duration={1000} distance="20px">
            <div className="main">
                <div className="podcast-header">
                    <h1 className="podcast-header-title">{podcastSection.title}</h1>
                    <p className={isDark ? "dark-mode podcast-header-subtitle" : "subTitle podcast-header-subtitle"}>
                        {podcastSection.subtitle}
                    </p>
                </div>
                <div className="chat-box" onClick={handleChatBoxClick}>
                    <BiChat size={24} />
                    <span>Chat with AI</span>
                </div>
            </div>
        </Fade>
    );
}
