import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UserHome.css';
import { splashScreen } from "../portfolio";
import { StyleProvider } from "../contexts/StyleContext";
import SplashScreen from "../pages/SplashScreen";
import Header from "../pages/Header";
import { useLocalStorage } from "../useLocalStorage";
import Project from "../pages/Project";
import Footer from "../pages/Footer";
import ChatBox from "../pages/ChatBox";
// Create axios instance
// const api = axios.create({
//     baseURL: 'https://graduationshowcase.online/api/v1',
//     headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//     }
// });

const UserHomePage = () => {

    const darkPref = window.matchMedia("(prefers-color-scheme: dark)");
    const [isDark, setIsDark] = useLocalStorage("isDark", darkPref.matches);
    const [splashVisible, setSplashVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSplashVisible(false);
        }, splashScreen.duration); // Duration from your portfolio configuration

        return () => clearTimeout(timer);
    }, []);

    const changeTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <div className= "user-home">
          {/* <StyleProvider value={{ isDark: isDark, changeTheme: changeTheme }}> */}
            {splashVisible ? (
              <SplashScreen />
            ) : (
              <div className="page-container">
                <Header />
                <div className="content">
                  <Project />
                  <ChatBox />
                </div>
                <Footer />
              </div>
            )}
          {/* </StyleProvider> */}
        </div>
      );
};

export default UserHomePage;
