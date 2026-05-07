import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromId, toId, anchorText } = body;
    if (!fromId || !toId || !anchorText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const entries = [
      { from_post_id: fromId, to_post_id: toId, anchor_text: anchorText },
      { from_post_id: toId, to_post_id: fromId, anchor_text: anchorText },
    ];

    const { data, error } = await supabase
      .from("internal_links")
      .insert(entries)
      .select();
    if (error) {
      console.error("Error inserting internal links:", error);
      return NextResponse.json(
        { error: "Failed to create internal links" },
        { status: 500 },
      );
    }

    return NextResponse.json({ created: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fromId = url.searchParams.get('fromId');
    if (!fromId) return NextResponse.json({ error: 'fromId required' }, { status: 400 });

    const { data, error } = await supabase
      .from('internal_links')
      .select('to_post_id,anchor_text')
      .eq('from_post_id', fromId);

    if (error) {
      console.error('Error fetching internal links:', error);
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
