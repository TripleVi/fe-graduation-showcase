import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserContextProvider } from "./UserContext";
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import UserHomePage from './pages/UserHome';
import DetailProjectPage from './pages/DetailProject';
import ChatPage from "./pages/ChatPage";
import './App.css';

function App() {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/userhome" element={<UserHomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/projects/:projectId" element={<DetailProjectPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

export default App;
