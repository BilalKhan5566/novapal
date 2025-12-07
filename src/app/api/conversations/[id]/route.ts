import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') ?? '1';

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid conversation ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const conversationId = parseInt(id);
    const parsedUserId = parseInt(userId);

    // Query conversation with userId filter
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, parsedUserId)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json(
        {
          error: 'Conversation not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Query all messages for this conversation, ordered by createdAt ASC
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Return conversation with messages
    return NextResponse.json(
      {
        id: conversation[0].id,
        userId: conversation[0].userId,
        title: conversation[0].title,
        createdAt: conversation[0].createdAt,
        updatedAt: conversation[0].updatedAt,
        messages: conversationMessages.map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          role: msg.role,
          content: msg.content,
          modelUsed: msg.modelUsed,
          createdAt: msg.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET conversation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') ?? '1';

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid conversation ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const conversationId = parseInt(id);
    const parsedUserId = parseInt(userId);

    // Verify conversation exists and belongs to user
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, parsedUserId)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json(
        {
          error: 'Conversation not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete conversation (messages will cascade delete automatically)
    await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, parsedUserId)
        )
      );

    // Return 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE conversation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}