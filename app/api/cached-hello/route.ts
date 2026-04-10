import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const CACHE_KEY = "hello:data";
const CACHE_TTL = 10;

export async function GET() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    console.log("캐시 히트!");
    return NextResponse.json({ source: "cache", data: JSON.parse(cached) });
  }

  console.log("캐시 미스 — 새로 생성");
  const freshData = {
    message: "Hello from server",
    time: new Date().toISOString(),
  };

  await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(freshData));

  return NextResponse.json({ source: "fresh", data: freshData });
}
