export default function signaling(io) {
  const rooms = new Map();

  io.on('connection', (socket) => {
    socket.on('create-room', (roomId) => {
      rooms.set(roomId, { host: socket.id, participants: new Set([socket.id]) });
      socket.join(roomId);
      socket.emit('room-created', roomId);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      const room = rooms.get(roomId) || { participants: new Set() };
      room.participants.add(socket.id);
      rooms.set(roomId, room);
      socket.to(roomId).emit('peer-joined', socket.id);
    });

    socket.on('offer', ({ to, offer }) => {
      io.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
      io.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        room.participants.delete(socket.id);
        socket.to(roomId).emit('peer-left', socket.id);
      }
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, id) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id);
          socket.to(id).emit('peer-left', socket.id);
        }
      });
    });
  });
}
