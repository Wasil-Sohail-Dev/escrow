import { NextResponse } from "next/server";
import { Server } from "socket.io";

let io: Server | null = null;

export async function GET() {
  // Ensure that WebSocket server is initialized
  if (!io) {
    io = new Server({
      path: "/api/socket",
      transports: ["websocket"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }

  // Broadcast a notification to all connected clients
  io.emit("notification", {
    message: "This is a server-triggered notification!",
  });

  return NextResponse.json({ message: "Notification sent!" });
}
