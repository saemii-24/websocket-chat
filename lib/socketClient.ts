// 클라이언트 측에서 사용할 소켓을 연결하기 위한 코드
"use client";
import { io } from "socket.io-client";

export const socket = io(); // 서버와 연결된 소켓을 생성
