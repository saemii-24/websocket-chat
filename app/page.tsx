"use client";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socketClient";

export default function Home() {
  // 채팅방 이름
  const [room, setRoom] = useState("");

  // 방에 들어갔는지 체크
  const [joined, setJoined] = useState(false);

  // 채팅 메시지들 저장소
  const [messages, setMessages] = useState<
    {
      sender: string;
      message: string;
    }[]
  >([]);
  // 내 닉네임
  const [userName, setUserName] = useState("");

  // 페이지 로드될 때 한 번만 실행
  useEffect(() => {
    // 서버에서 보내주는 정보 받음 (socket.on)
    // 누군가 메시지 보내면 → 내 화면에 추가
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // 서버에서 보내주는 정보 받음 (socket.on)
    // 누군가 방에 들어오면 → "XXX님 입장" 메시지 추가
    socket.on("user_joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    // 페이지 떠날 때 → 소켓 연결 정리
    return () => {
      socket.off("user_joined");
      socket.off("message");
    };
  }, []);

  // "입장하기" 버튼 클릭했을 때
  const handleJoinRoom = () => {
    if (room && userName) {
      //정보 받아서 서버에 전송해줌 (socket.emit)
      socket.emit("join-room", { room, username: userName });
      setJoined(true); // 입장 완료 표시
    }
  };

  // 메시지 "전송" 버튼 클릭했을 때
  const handleSendMessage = (message: string) => {
    const data = { room, message, sender: userName };

    setMessages((prev) => [...prev, { sender: userName, message }]); // 내 메시지 바로 보여주기
    socket.emit("message", data); // 서버야! 이 메시지 다른 사람들한테도 보내줘
  };

  return (
    <div className="flex mt-24 justify-center w-full">
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col items-center">
          <h1 className="mb-4 text-2xl font-bold">Join a Room</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">Room: 1</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg"></div>
          <div>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                message={msg.message}
                isOwnMessage={msg.sender === userName}
              />
            ))}
          </div>
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}
