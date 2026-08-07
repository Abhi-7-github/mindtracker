import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB, getDBState } from './config/db.js';
import signaling from './socket/signaling.js';

const PORT = process.env.PORT || 9090;

async function start() {
  await connectDB();
  const db = getDBState();
  console.log(`MongoDB state: ${db.state} (${db.code})`);
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });


  signaling(io);
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
