import { Server, Socket } from 'socket.io';
import { User } from '../app/modules/user/user.model';


const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected', socket.id);

    socket.on('fcmToken', async data => { 
      if(!data.userId || !data.fcmToken) return;
      try {
        const user = await User.findByIdAndUpdate(
          data.userId,
          { fcmToken: data.fcmToken },
          { new: true, upsert: true }
        );
      } catch (error) {
        console.log(error);
      }
    });

    // On disconnect, clean up
    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });
  });
};

export const socketHelper = { socket };
