import fs from "fs";
import path from "path";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const PLACE_ID = process.env.PLACE_ID;
const FRESH_DAYS = 5;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export type PlaceReview = {
  rating: number;
  snippet: string;
  date: string;
  isoDate: string;
  likes?: number;
  link?: string;
  user: {
    name: string;
    link?: string;
    thumbnail?: string;
  };
};

type ReviewsCache = {
  fetchedAt: number;
  reviews: PlaceReview[];
};

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "la-cuisine-data")
  : path.join(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "reviews-cache.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readCache(): ReviewsCache | null {
  if (!fs.existsSync(CACHE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as ReviewsCache;
  } catch {
    return null;
  }
}

function writeCache(cache: ReviewsCache) {
  ensureDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function isFresh(cache: ReviewsCache) {
  return Date.now() - cache.fetchedAt < FRESH_DAYS * MS_IN_DAY;
}

async function fetchFromSerper(): Promise<ReviewsCache> {
  const res = await fetch("https://google.serper.dev/reviews", {
    method: "POST",
    headers: {
      "X-API-KEY": String(SERPER_API_KEY),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      placeId: PLACE_ID,
      sortBy: "newest",
    }),
  });

  if (!res.ok) throw new Error(`Serper request failed: ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(`Serper error: ${data.error}`);

  return {
    fetchedAt: Date.now(),
    reviews: (data.reviews ?? []) as PlaceReview[],
  };
}

export async function getPlaceReviews(): Promise<ReviewsCache> {
  const cache = readCache();
  if (cache && isFresh(cache)) return cache;

  if (!SERPER_API_KEY || !PLACE_ID) {
    if (cache) return cache;
    throw new Error("Missing SERPER_API_KEY or PLACE_ID");
  }

  try {
    const fresh = await fetchFromSerper();
    writeCache(fresh);
    return fresh;
  } catch (err) {
    if (cache) return cache;
    throw err;
  }
}
