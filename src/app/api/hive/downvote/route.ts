import { NextRequest, NextResponse } from 'next/server';
import { hiveService } from '@/lib/hive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, permlink, url, weight = -10000 } = body;

    let postAuthor = author;
    let postPermlink = permlink;

    // If URL is provided instead of author/permlink, parse it
    if (url && (!author || !permlink)) {
      const parsed = hiveService.parseHiveUrl(url);
      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid Hive post URL' },
          { status: 400 }
        );
      }
      postAuthor = parsed.author;
      postPermlink = parsed.permlink;
    }

    if (!postAuthor || !postPermlink) {
      return NextResponse.json(
        { error: 'Author and permlink are required' },
        { status: 400 }
      );
    }

    // Validate weight is negative
    if (weight > 0) {
      return NextResponse.json(
        { error: 'Weight must be negative for downvotes' },
        { status: 400 }
      );
    }

    await hiveService.downvotePost(postAuthor, postPermlink, weight);

    return NextResponse.json({
      success: true,
      message: `Successfully downvoted @${postAuthor}/${postPermlink}`,
      author: postAuthor,
      permlink: postPermlink,
      weight: weight
    });

  } catch (error) {
    console.error('Hive downvote error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to downvote post' },
      { status: 500 }
    );
  }
}