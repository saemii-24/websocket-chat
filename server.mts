// 서버 측 코드: HTTP 서버와 소켓 서버 설정
import next from "next";
import { createServer } from "node:http"; // HTTP 서버 생성 함수
import { Server } from "socket.io"; // socket.io 서버 라이브러리 임포트

const dev = process.env.NODE_ENV !== "production"; // 개발 환경인지 여부 확인
const hostname = process.env.HOSTNAME || "localhost"; // 호스트명 설정 (기본값: localhost)
const port = parseInt(process.env.PORT || "3000", 10); // 포트 번호 설정 (기본값: 3000)

//전체 실행 진행 과정
// WebSocket은 서버와 클라이언트 간의 실시간 통신을 가능하게 하므로,
// 서버와 클라이언트 모두 준비가 되어야 한다.

// 이 코드는 서버 측에서 HTTP 서버와 소켓 서버를 설정하는 과정이다.
// 따라서 서버가 필요하므로 `app = next({ dev, hostname, port })`를 이용해 Next.js 서버를 만들고,
// 서버가 준비되면 `app.prepare()`를 호출하여 웹소켓 연결을 시작한다.

// `io.on("connection")`은 클라이언트가 서버에 연결되었을 때 실행되는 이벤트 핸들러이다.
// 이 핸들러 안에서 클라이언트가 방에 참여하거나 메시지를 보낼 때, 연결이 끊어졌을 때의 이벤트를 처리한다.
// `sockets.on`은 클라이언트가 방에 참여하거나 메시지를 보낼 때 발생하는 이벤트를 처리하는 부분이다.
// `socket.to(room).emit`은 특정 방에 있는 다른 사용자들에게 메시지를 전송하는 코드이다.
// `socket.join(room)`은 사용자를 특정 방에 참여시키는 부분이다.

//  route.ts는 기본적으로 HTTP 통신을 위한 API 라우트로 사용되며,
// 주로 CRUD(Create, Read, Update, Delete)와 같은 HTTP 요청을 처리하는 데 적합한 곳으로
// websocket은 custom server를 이용하는 것이 좋다.
// next js에서 커스텀 서버 만드는 방법은 아래 공식문서를 이용하도록 한다.
//https://nextjs.org/docs/app/guides/custom-server
//
const app = next({ dev, hostname, port }); // Next.js 애플리케이션 설정
const handler = app.getRequestHandler(); // Next.js의 요청 핸들러

// 애플리케이션 준비 완료 후 서버 시작
app.prepare().then(() => {
  const httpServer = createServer(handler); // HTTP 서버 생성
  const io = new Server(httpServer); // 소켓 서버 생성 (HTTP 서버와 함께)

  // 클라이언트가 연결되었을 때 실행되는 이벤트 핸들러
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`); // 연결된 클라이언트의 소켓 ID 출력

    // 'join-room' 이벤트: 사용자가 방에 참여할 때
    socket.on("join-room", ({ room, username }) => {
      socket.join(room); // 방에 사용자를 참여시킴
      console.log(`User ${username} joined room ${room}`); // 방에 참가한 사용자 정보 출력
      socket.to(room).emit("user_joined", `${username} joined room`); // 방에 참여한 사용자에게 알림 전송
    });

    // 'message' 이벤트: 사용자가 방에 메시지를 보낼 때
    socket.on("message", ({ message, room, sender }) => {
      console.log(`Message from ${sender} in room ${room}: ${message}`); // 메시지 출력
      socket.to(room).emit("message", { sender, message }); // 방에 있는 모든 사용자에게 메시지 전송
    });

    // 'disconnect' 이벤트: 사용자가 연결을 끊었을 때
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`); // 연결이 끊어진 사용자 정보 출력
    });
  });

  // 서버가 지정된 포트에서 실행되도록 설정
  httpServer.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`); // 서버 실행 알림
  });
});
