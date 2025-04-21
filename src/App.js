import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { UserContextProvider } from "./UserContext";
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import UserHomePage from './pages/UserHome';
import DetailProjectPage from './pages/DetailProject';
import ChatPage from "./pages/ChatPage";
// import Box from "./pages/Box";
import LandingPage from "./pages/LandingPage";
import NoPermissionPage from "./pages/NoPermissionPage"; // Import the NoPermissionPage component
import './App.css';

const PrivateRoute = ({ element, redirectTo }) => {
  const token = localStorage.getItem('token');
  const userRoleId = token ? JSON.parse(atob(token.split('.')[1])).roleId : null;

  if (userRoleId === 1) {
    return element;
  } else {
    return <Navigate to={redirectTo} />;
  }
};

function App() {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* LandingPage as default */}
          <Route path="/login" element={<LoginPage />} /> {/* LoginPage at its own route */}
          <Route path="/userhome" element={<UserHomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/projects/:projectId" element={<DetailProjectPage />} />
          
          {/* Protected route for /home */}
          <Route 
            path="/home" 
            element={
              <PrivateRoute 
                element={<HomePage />} 
                redirectTo="/no-permission" 
              />
            } 
          />

          {/* Page for no permission */}
          <Route path="/no-permission" element={<NoPermissionPage />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

export default App;
