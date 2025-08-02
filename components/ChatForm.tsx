"use client";
import React, { useState } from "react";

const ChatForm = () => {
  const [message, setMessage] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 border-2 py-2 rounded-lg focus:outline-none"
        placeholder="Type your message here..."
      />
      <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500">
        Send
      </button>
    </form>
  );
};

export default ChatForm;
