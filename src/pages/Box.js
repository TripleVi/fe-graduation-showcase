import React, { useContext } from "react";
import '../css/Box.css';
import { Fade } from "react-reveal";
//import StyleContext from "../contexts/StyleContext"; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import { BiChat } from 'react-icons/bi'; // Import an icon for the chat box

export default function Box() {
    //const { isDark } = useContext(StyleContext);


    const navigate = useNavigate(); // Initialize navigate for navigation

    // Function to handle chat box click
    const handleChatBoxClick = () => {
        navigate('/chat'); // Use navigate to go to the chat page
    };

    return (
        <Fade bottom duration={1000} distance="20px">
            <div className="main">
                <div className="chat-box" onClick={handleChatBoxClick}>
                    <BiChat size={24} />
                    <span>Chat with AI</span>
                </div>
            </div>
        </Fade>
    );
}
