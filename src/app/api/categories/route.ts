import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string = (body.name || "").trim();
    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Upsert category by slug to avoid duplicates
    const { data, error } = await supabase
      .from("categories")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
