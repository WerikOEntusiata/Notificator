import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    const db = await getDb();
    const notifications = db.data?.notifications || [];
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;

    const newNotification = {
      id: newId,
      message,
      timestamp: new Date().toISOString(),
    };

    db.data?.notifications.push(newNotification);
    await db.write();

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const notifications = db.data?.notifications || [];
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}