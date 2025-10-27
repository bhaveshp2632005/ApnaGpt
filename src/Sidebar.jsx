import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./AuthContext.jsx";
import { X } from "react-feather";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
    isOpen,
    setIsOpen,
  } = useContext(MyContext);

  const { user, token, logout } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);

  // ✅ Fetch threads securely
  const getAllThreads = async () => {
    try {
      const response = await fetch("https://apnagpt-backend-4u32.onrender.com/api/threads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🟢 include token here
        },
        credentials: "include",
      });

      if (response.status === 401) {
        console.warn("Unauthorized - logging out...");
        await logout();
        return;
      }

      const res = await response.json();
      if (!Array.isArray(res)) return;

      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleResize = () => setIsVisible(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    try {
      const response = await fetch(`https://apnagpt-backend-4u32.onrender.com/api/threads/${newThreadId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      const res = await response.json();
      if (!res.messages) return;

      setPrevChats(res.messages);
      setNewChat(false);
      setReply(null);
      setIsOpen(false);
    } catch (err) {
      console.error("Error changing thread:", err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`https://apnagpt-backend-4u32.onrender.com/api/threads/${threadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));
      if (threadId === currThreadId) createNewChat();
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="menu-btn" onClick={() => setIsOpen(true)}>
          ☰
        </button>
      )}

      <section className={`sidebar ${isOpen ? "active" : ""}`}>
        {isVisible && (
          <div className="close-btn">
            <X onClick={() => setIsOpen(false)} />
          </div>
        )}

        <button onClick={createNewChat}>
          <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
          <span>
            <i className="fa-solid fa-pen-to-square"></i>
          </span>
        </button>

        <ul className="history">
          {allThreads?.map((thread, idx) => (
            <li
              key={thread.threadId || idx}
              onClick={() => changeThread(thread.threadId)}
              className={thread.threadId === currThreadId ? "highlighted" : ""}
            >
              {thread.title}
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          ))}
        </ul>

        <hr />
        <div className="user-info">
          <img
            src={user?.profilePic || "src/assets/image.png"}
            alt={user?.name}
            className="user-logo"
          />
          <span className="user-name">{user?.name}</span>
        </div>
      </section>
    </>
  );
}

export default Sidebar;
