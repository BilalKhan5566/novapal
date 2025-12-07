import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = parseInt(params.id);
    
    // Validate conversation ID
    if (!conversationId || isNaN(conversationId)) {
      return NextResponse.json(
        { 
          error: 'Valid conversation ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Get userId from query params (default to 1 for auth)
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') ?? '1');

    // Parse request body
    const body = await request.json();
    const { role, content, modelUsed } = body;

    // Validate required fields
    if (!role) {
      return NextResponse.json(
        { 
          error: 'Role is required',
          code: 'MISSING_ROLE'
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { 
          error: 'Content is required and must be a string',
          code: 'INVALID_CONTENT'
        },
        { status: 400 }
      );
    }

    // Validate role is either 'user' or 'assistant'
    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { 
          error: 'Role must be either "user" or "assistant"',
          code: 'INVALID_ROLE'
        },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const conversation = await db.select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json(
        { 
          error: 'Conversation not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Insert new message
    const newMessage = await db.insert(messages)
      .values({
        conversationId,
        role: role.trim(),
        content: content.trim(),
        modelUsed: modelUsed?.trim() || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Update conversation updatedAt timestamp
    await db.update(conversations)
      .set({
        updatedAt: new Date().toISOString()
      })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json(newMessage[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}