import { getPlaceReviews } from "@/lib/google-reviews";

export type Testimonial = {
  id: number | string;
  quote: string;
  name: string;
  event: string;
  rating: number;
  link?: string;
};

const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Every detail felt effortless, from the first conversation to the last plate. The food was extraordinary and our guests are still talking about the evening. Chef Manou and the team crafted a seasonal five-course menu that perfectly captured authentic Parisian gastronomy with stunning presentation.",
    name: "Camille & Thomas",
    event: "Private Dinner · Abu Dhabi",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Manou understood our brand brief immediately and delivered an executive reception that was both elevated and deeply hospitable. Pure Parisian finesse. The passed canapés and artisanal patisserie were exceptional.",
    name: "Sophie Laurent",
    event: "Luxury Brand Launch · DIFC, Dubai",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "A rare combination of calm, precision, and genuine warmth. The table looked breathtaking, and every course arrived at the perfect cadence. Truly made our milestone anniversary unforgettable.",
    name: "The Martin Family",
    event: "Anniversary Celebration · Saadiyat Island",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Flawless execution for our 80-guest reception. The live stations were a major highlight, and the seamless front-of-house service gave us total peace of mind throughout the entire night.",
    name: "Alexandre & Nour",
    event: "Wedding Reception · Dubai",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Discreet, highly sophisticated, and punctual. The seasonal French dishes were plated with Michelin-level finesse. Our international board members were thoroughly impressed.",
    name: "David K.",
    event: "Executive Board Dinner · ADGM, Abu Dhabi",
    rating: 5,
  },
  {
    id: 6,
    quote:
      "From the bespoke canapé selection to the signature dessert tower, everything exceeded our high expectations. The team handled every dietary request with grace and creativity.",
    name: "Elena Rostova",
    event: "VIP Birthday Soirée · Palm Jumeirah",
    rating: 5,
  },
];

type RawReview = {
  isoDate: string;
  snippet?: string;
  translatedSnippet?: string;
  user?: { name: string; link?: string };
  date: string;
  rating: number;
  link?: string;
};

// Google reviews (via the cached Serper feed) mapped to testimonial cards.
// Falls back to the curated testimonials when the feed is unavailable or
// has no usable text, so the section always renders.
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { reviews } = await getPlaceReviews();
    const usable = (reviews as RawReview[]).filter(
      (review) => review.snippet || review.translatedSnippet,
    );
    if (usable.length === 0) return fallbackTestimonials;
    return usable.map((review, index) => ({
      id: review.isoDate || index,
      quote: review.translatedSnippet ?? review.snippet ?? "",
      name: review.user?.name ?? "Google User",
      event: `Google Review · ${review.date}`,
      rating: review.rating,
      link: review.link ?? review.user?.link,
    }));
  } catch {
    return fallbackTestimonials;
  }
}
