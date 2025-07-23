import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  try {
    const imageRes = await fetch(imageUrl);
    const contentType = imageRes.headers.get("content-type");
    const buffer = await imageRes.arrayBuffer();
    const base64ImageData = Buffer.from(buffer).toString('base64');

    return new NextResponse(base64ImageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
