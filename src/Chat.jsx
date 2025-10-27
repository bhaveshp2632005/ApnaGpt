import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if (!reply) {
      setLatestReply(null);
      return;
    }

    if (!Array.isArray(prevChats) || prevChats.length === 0) return;

    const content = reply.split(""); // char by char typing
    let idx = 0;

    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(""));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 25); // faster typing

    return () => clearInterval(interval);
  }, [reply, prevChats]);

  const chatsArray = prevChats || [];

  return (
    <>
      {newChat && <h1 >Start a New Chat!</h1>}
      <div className="chats">
        {chatsArray.map((chat, idx) => {
          const isLatest = idx === chatsArray.length - 1 && latestReply !== null && chat.role === "assistant";

          return (
            <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
              {chat.role === "user" ? (
                <p className="userMessage">{chat.content}</p>
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {isLatest ? latestReply : chat.content}
                </ReactMarkdown>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Chat;
