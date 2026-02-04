import { io, Socket } from 'socket.io-client';
import type { Activity } from '../types/Activity';

type EventCallback = (data: Activity) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('join', userId);
    });

    this.socket.on('new-activity', (activity: Activity) => {
      this.notifyListeners('new-activity', activity);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: Activity) {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(callback => callback(data));
  }
}

export const socketService = new SocketService();