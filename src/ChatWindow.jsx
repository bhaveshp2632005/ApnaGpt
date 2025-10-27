import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);
  
  const { user, setUser,logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handlelogout = async () => {
  try {
  
    if (user.authProvider === "local") {
      // Local login logout
      await logout();
      navigate("/login");
      return;
    } else {
      // Google or external provider logout
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    }

    // Clear user from context
    setUser(null);

    // Navigate to login
    navigate("/login");
  } catch (err) {
    console.error("Logout error:", err);
    // Still navigate to login even if logout fails
    navigate("/login");
  }
};


  const getReply = async () => {
  if (!prompt) return;

  setLoading(true);
  setNewChat(false);

  try {
    const token = localStorage.getItem("token"); // ✅ get JWT from storage

    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ attach JWT
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    });

    if (response.status === 401) {
      alert("Session expired or unauthorized. Please log in again.");
      navigate("/login");
      return;
    }

    const res = await response.json();

    // ✅ set reply and add both user & assistant messages
    setReply(res.reply);
    setPrevChats((prev) => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: res.reply },
    ]);

  } catch (err) {
    console.error("Chat request error:", err);
    alert("Something went wrong. Please try again.");
  }

  setPrompt("");
  setLoading(false);
};

  // Handle dropdown toggle
  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  // Return null if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span className={`name${isOpen ? " active" : ""}`}>ApnaGPT</span>
        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
           <img src={user.profilePic||"src/assets/image.png"} alt={user.name} className="userIcon" />
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem" onClick={handlelogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      {/* Chat messages */}
      <Chat />

      {/* Loading spinner */}
      <ScaleLoader color="#fff" loading={loading} />

      {/* Input box */}
      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          ApnaGPT can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;