export default function signaling(io) {
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      if (!roomId) return;
      const normRoomId = String(roomId).trim().toLowerCase();

      socket.join(normRoomId);

      const room = rooms.get(normRoomId) || { participants: new Set() };
      const existingPeers = Array.from(room.participants).filter((id) => id !== socket.id);

      room.participants.add(socket.id);
      rooms.set(normRoomId, room);

      console.log(`Socket ${socket.id} joined room ${normRoomId}. Existing peers:`, existingPeers);

      // Send existing peers to newly joined participant
      socket.emit('existing-peers', existingPeers);

      // Notify existing participants in the room that a new peer joined
      socket.to(normRoomId).emit('peer-joined', socket.id);
    });

    socket.on('offer', ({ to, offer }) => {
      console.log(`Relaying offer from ${socket.id} to ${to}`);
      if (to) {
        io.to(to).emit('offer', { from: socket.id, offer });
      }
    });

    socket.on('answer', ({ to, answer }) => {
      console.log(`Relaying answer from ${socket.id} to ${to}`);
      if (to) {
        io.to(to).emit('answer', { from: socket.id, answer });
      }
    });

    socket.on('ice-candidate', ({ to, roomId, candidate }) => {
      if (to) {
        io.to(to).emit('ice-candidate', { from: socket.id, candidate });
      } else if (roomId) {
        const normRoomId = String(roomId).trim().toLowerCase();
        socket.to(normRoomId).emit('ice-candidate', { from: socket.id, candidate });
      }
    });

    socket.on('leave-room', (roomId) => {
      if (!roomId) return;
      const normRoomId = String(roomId).trim().toLowerCase();
      socket.leave(normRoomId);

      const room = rooms.get(normRoomId);
      if (room) {
        room.participants.delete(socket.id);
        if (room.participants.size === 0) {
          rooms.delete(normRoomId);
        }
      }
      socket.to(normRoomId).emit('peer-left', socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      rooms.forEach((room, normRoomId) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);
          socket.to(normRoomId).emit('peer-left', socket.id);
          if (room.participants.size === 0) {
            rooms.delete(normRoomId);
          }
        }
      });
    });
  });
}
