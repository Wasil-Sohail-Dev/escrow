import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

let io: Server | null = null;

// This is the WebSocket API route handler
export async function GET() {
  if (!io) {
    // Create WebSocket server
    io = new Server({
      path: '/api/socket',
      transports: ['websocket'],
      cors: {
        origin: '*', // Allow all origins (you can restrict this for production)
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('a user connected');

      // Send a welcome notification when a user connects
      socket.emit('notification', { message: 'You are connected to the WebSocket server!' });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  }

  // You can use this API endpoint to check if the WebSocket server is running
  return NextResponse.json({ message: 'Socket server is running' });
}
