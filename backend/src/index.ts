import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth';
import providerRoutes from './routes/providers';
import bookingRoutes from './routes/bookings';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import paystackRoutes from './routes/paystack';
import passwordRoutes from './routes/password';
import Message from './models/Message';
import User from './models/User';

// Force Google DNS
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/auth', passwordRoutes);

app.get('/', (_, res) => res.json({ message: 'SuperConnect API running' }));

// Socket.io chat
io.on('connection', (socket) => {
  // Join a booking room
  socket.on('join_booking', (bookingId: string) => {
    socket.join(bookingId);
  });

  // Send a message
  socket.on('send_message', async (data: { bookingId: string; token: string; text: string }) => {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user) return;

      const message = await Message.create({
        booking: data.bookingId,
        sender: user._id,
        senderName: user.name,
        text: data.text,
      });

      io.to(data.bookingId).emit('new_message', {
        _id: message._id,
        senderName: message.senderName,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/supert';

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
  httpServer.listen(PORT, () => console.log(`SuperConnect server running on port ${PORT}`));
}).catch(err => console.error('DB connection error:', err));
