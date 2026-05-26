import NotificationReceiver from '@/components/NotificationReceiver';
import { MadeWithDyad } from '@/components/made-with-dyad';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <NotificationReceiver />
      <MadeWithDyad />
    </div>
  );
}