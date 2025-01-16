import io from 'socket.io-client';

// Connect to the WebSocket server at /api/socket endpoint
const socket = io('/api/socket');

export default socket;
