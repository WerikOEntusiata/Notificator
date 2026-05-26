"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, Volume2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Notification {
  id: number;
  message: string;
  timestamp: string;
}

export default function NotificationChat() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    fetchNotifications();
    requestNotificationPermission();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificações ativadas!');
      }
    }
  };

  const playLoudAlert = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 1.0;
      
      oscillator.start();
      setIsPlaying(true);
      
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to play alert');
      toast.error('Erro ao tocar alerta');
    }
  };

  const sendNotification = async () => {
    if (!message.trim()) return;

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const newNotification = await res.json();
        setNotifications([...notifications, newNotification]);
        setMessage('');
        playLoudAlert();
        showBrowserNotification(newNotification.message);
        toast.success('Notificação enviada!');
      }
    } catch (error) {
      console.error('Failed to send notification');
      toast.error('Erro ao enviar notificação');
    }
  };

  const showBrowserNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alerta!', {
        body: message,
        icon: '/favicon.ico',
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-blue-600 dark:bg-blue-700 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Bell className="text-white" size={24} />
          <h1 className="text-xl font-bold text-white">Notificações</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          onClick={playLoudAlert}
          disabled={isPlaying}
        >
          <Volume2 size={18} className="mr-2" />
          {isPlaying ? 'Tocando...' : 'Testar Alerta'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Bell size={48} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação ainda</p>
            <p className="text-sm">Envie uma notificação para começar</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-end justify-end"
            >
              <div className="max-w-[80%] bg-blue-600 dark:bg-blue-700 text-white rounded-2xl rounded-br-sm px-4 py-2 shadow-sm">
                <p className="text-base">{notification.message}</p>
                <p className="text-xs text-blue-100 dark:text-blue-200 mt-1 text-right">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua notificação..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && sendNotification()}
          />
          <Button
            onClick={sendNotification}
            disabled={!message.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}