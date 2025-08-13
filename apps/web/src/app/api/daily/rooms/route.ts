import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dailyService from '@/services/dailyService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      meetingId,
      name,
      privacy = 'private',
      maxParticipants = 20,
      enableChat = true,
      enableRecording = true,
      enableScreenshare = true,
      enableVirtualBackgrounds = true,
      exp = 86400, // 24 hours
    } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const room = await dailyService.createOrGetRoom(meetingId, {
      name: name || meetingId,
      privacy,
      maxParticipants,
      exp,
    });

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error('Error creating Daily.co room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('room');

    if (roomName) {
      const room = await dailyService.getRoom(roomName);
      return NextResponse.json({ room });
    } else {
      const rooms = await dailyService.listRooms();
      return NextResponse.json({ rooms });
    }
  } catch (error: any) {
    console.error('Error fetching Daily.co rooms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('room');

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    await dailyService.deleteRoom(roomName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Daily.co room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete room' },
      { status: 500 }
    );
  }
} 