import React from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { MyContext } from "./MyContext";
import { v4 as uuid } from "uuid";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import SignupPage from "./signup";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import ChatWindow from './ChatWindow';


const App = () => {
  const [prompt, setPrompt] = React.useState("");
  const [reply, setReply] = React.useState("");
  const [currThreadId, setCurrThreadId] = React.useState(uuid());
  const [prevChats, setPrevChats] = React.useState([]);
  const [newChat, setNewChat] = React.useState(true);
  const [allThreads, setAllThreads] = React.useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const providerValue = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
    isOpen,
    setIsOpen,

  };

  return (<Router>
    <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MyContext.Provider value={providerValue}>
                  <div className="app">
                    <Sidebar />
                    <ChatWindow />
                  </div>
                </MyContext.Provider>
              </ProtectedRoute>
            }
          />
        </Routes>
      
    </AuthProvider>
    </Router>
  );
};

export default App;
