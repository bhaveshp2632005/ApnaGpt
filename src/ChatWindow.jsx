import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";
import { API_BASE_URL } from "./config";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ---------------- LOGOUT FUNCTION ----------------
  const handleLogout = async () => {
    try {
      if (user?.authProvider === "local") {
        // Local login logout (JWT)
        await logout();
      } else {
        // Google or external provider logout (session)
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      }

      // Clear user context and redirect
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  // ---------------- SEND CHAT MESSAGE ----------------
  const getReply = async () => {
    if (!prompt) return;

    setLoading(true);
    setNewChat(false);

    try {
      const token = localStorage.getItem("token");

      // Build request options dynamically
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          threadId: currThreadId,
        }),
      };

      if (token) {
        // Local/JWT user
        fetchOptions.headers.Authorization = `Bearer ${token}`;
      } else {
        // Google session user
        fetchOptions.credentials = "include";
      }

      // console.log("🔹 Sending chat request with:", token ? "JWT" : "Google Session");

      const response = await fetch(`${API_BASE_URL}/api/chat`, fetchOptions);

      if (response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chat API error");
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
      console.error("❌ Chat request error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  // ---------------- PROFILE DROPDOWN ----------------
  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  // If no user found (unauthenticated), show nothing
  if (!user) return null;

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span className={`name${isOpen ? " active" : ""}`}>ApnaGPT</span>
        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <img
              src={user.profilePic || "src/assets/image.png"}
              alt={user.name}
              className="userIcon"
            />
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem" onClick={handleLogout}>
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
