import NotificationChat from '@/components/NotificationChat';
import { MadeWithDyad } from '@/components/made-with-dyad';

export default function Home() {
  return (
    <div className="h-screen">
      <NotificationChat />
      <MadeWithDyad />
    </div>
  );
}