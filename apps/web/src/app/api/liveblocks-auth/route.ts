import { Liveblocks } from "@liveblocks/node";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 403 });
  }
  const session = liveblocks.prepareSession(
    user.id,
    {
      userInfo: {
        name: user.firstName || "Anonymous",
        avatar: user.imageUrl,
      }
    }
  );
  const { room } = await request.json();
  session.allow(room, session.FULL_ACCESS);
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}