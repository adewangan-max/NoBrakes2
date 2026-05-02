import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Increment views in Supabase
    // Note: You might want to use a RPC function for atomic increment
    // For now, we'll do a simple update if the post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, views')
      .eq('slug', slug)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', post.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
