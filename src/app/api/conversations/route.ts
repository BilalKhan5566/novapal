import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get('userId') ?? '1');

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Get all conversations for the user
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      userConversations.map(async (conversation) => {
        const messageCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(eq(messages.conversationId, conversation.id));

        const messageCount = messageCountResult[0]?.count ?? 0;

        return {
          id: conversation.id,
          userId: conversation.userId,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messageCount,
        };
      })
    );

    return NextResponse.json(conversationsWithCounts, { status: 200 });
  } catch (error) {
    console.error('GET conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { title, message, userId } = body;

    // Default userId to 1 (placeholder auth)
    userId = userId ?? 1;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Auto-generate title from message if not provided
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      title = message.length > 100 ? message.substring(0, 100).trim() + '...' : message.trim();
    }

    // Sanitize inputs
    title = title.trim();
    message = message.trim();

    const now = new Date().toISOString();

    // Create conversation
    const newConversation = await db
      .insert(conversations)
      .values({
        userId,
        title,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!newConversation || newConversation.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create conversation', code: 'CONVERSATION_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const conversationId = newConversation[0].id;

    // Create initial message
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId,
        role: 'user',
        content: message,
        modelUsed: null,
        createdAt: now,
      })
      .returning();

    if (!newMessage || newMessage.length === 0) {
      // Rollback: delete the conversation if message creation fails
      await db.delete(conversations).where(eq(conversations.id, conversationId));
      return NextResponse.json(
        { error: 'Failed to create initial message', code: 'MESSAGE_CREATE_FAILED' },
        { status: 500 }
      );
    }

    // Return conversation with messages array
    const response = {
      id: newConversation[0].id,
      userId: newConversation[0].userId,
      title: newConversation[0].title,
      createdAt: newConversation[0].createdAt,
      updatedAt: newConversation[0].updatedAt,
      messages: [
        {
          id: newMessage[0].id,
          conversationId: newMessage[0].conversationId,
          role: newMessage[0].role,
          content: newMessage[0].content,
          modelUsed: newMessage[0].modelUsed,
          createdAt: newMessage[0].createdAt,
        },
      ],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}