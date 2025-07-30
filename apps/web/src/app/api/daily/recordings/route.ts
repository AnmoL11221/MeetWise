import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dailyService from '@/services/dailyService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('room');
    const recordingId = searchParams.get('id');

    if (recordingId) {
      const downloadUrl = await dailyService.getRecordingUrl(recordingId);
      return NextResponse.json({ downloadUrl });
    } else {
      const recordings = await dailyService.listRecordings(roomName || undefined);
      return NextResponse.json({ recordings });
    }
  } catch (error: any) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
} 