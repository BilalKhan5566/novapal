import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    
    // Default to userId 1 for placeholder auth
    const userId = userIdParam ? parseInt(userIdParam) : 1;
    
    // Validate userId is a valid integer
    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          error: 'Invalid user ID',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Delete all conversations for the user
    // Messages will cascade delete automatically via foreign key constraint
    await db.delete(conversations)
      .where(eq(conversations.userId, userId));

    // Return 204 No Content on success (even if 0 conversations deleted)
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('DELETE /api/conversations/clear error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}