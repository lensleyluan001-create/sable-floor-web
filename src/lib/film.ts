export type LastId =
  | "house"
  | "vellie"
  | "golfer"
  | "chelsea"
  | "derby"
  | "loafer"
  | "sandal"
  | "hiking"
  | "combat"
  | "zip"
  | "wool"
  | "kids"
  | "book";

export type Chapter = {
  id: string;
  last: string;
  why: string;
  title: string;
  line: string;
  meta: string;
  still: string;
  video?: string;
};

export type LastBeat = {
  still: string;
  video: string;
  title: string;
  line: string;
  fit?: string;
};

export type LastTheme = {
  id: LastId;
  beats: LastBeat[];
};

export const CHAPTERS: Chapter[] = [
  {
    id: "house",
    last: "The house",
    why: "The last is the house. Everything else follows.",
    title: "We last them ourselves.",
    line: "The hide, the stitch, and the pair that leaves the bench. That is not a mill with a sticker.",
    meta: "Handmade in our factory · 2026",
    still: "/film/house.jpg",
    video: "/film/house.mp4",
  },
  {
    id: "vellie",
    last: "The vellie",
    why: "Cut for dust roads. Tuesday, not a shoot.",
    title: "Tuesday dirt.",
    line: "Karoo dust. A crease that knows the road. You wear them. You do not photograph them.",
    meta: "From R599  ·  45xxx",
    still: "/film/vellie.jpg",
    video: "/film/vellie.mp4",
  },
  {
    id: "golfer",
    last: "The golfer",
    why: "Crepe is for grass. Not tar.",
    title: "Crepe. Saturday.",
    line: "A pale sole on kikuyu. Coastal light. A veranda, not a runway.",
    meta: "From R850  ·  Six in the book",
    still: "/film/golfer.jpg",
    video: "/film/golfer.mp4",
  },
  {
    id: "chelsea",
    last: "The chelsea",
    why: "No lace. The line has to hold on its own.",
    title: "Keep their line.",
    line: "Wet city. Night pavement. The boot that does not slouch when the street does.",
    meta: "From the book  ·  45xxx",
    still: "/film/chelsea.jpg",
    video: "/film/chelsea.mp4",
  },
  {
    id: "derby",
    last: "The derby",
    why: "Open lacing. You see the last in the work.",
    title: "The work pair.",
    line: "Eyelets, welt, morning bench. The derby leaves looking like work, not costume.",
    meta: "From the book  ·  45xxx",
    still: "/film/derby.jpg",
    video: "/film/derby.mp4",
  },
  {
    id: "loafer",
    last: "The loafer",
    why: "No lace, no hurry. Shade, not a boardroom.",
    title: "Afternoon shade.",
    line: "Oak over a farm stoep. A penny loafer that slips on and stays.",
    meta: "From the book  ·  45xxx",
    still: "/film/loafer.jpg",
    video: "/film/loafer.mp4",
  },
  {
    id: "sandal",
    last: "The sandal",
    why: "Open leather for heat. Salt air, not a slide.",
    title: "Salt. Late sun.",
    line: "Two straps. Pale sand. The Indian Ocean out of focus, as it should be.",
    meta: "From the book  ·  45xxx",
    still: "/film/sandal.jpg",
    video: "/film/sandal.mp4",
  },
  {
    id: "hiking",
    last: "The hiking boot",
    why: "A path that climbs. Dew, not a gym.",
    title: "First light.",
    line: "Drakensberg trail. Fynbos. Dew on the leather before the climb.",
    meta: "From R799  ·  45xxx",
    still: "/film/hiking.jpg",
    video: "/film/hiking.mp4",
  },
  {
    id: "combat",
    last: "The combat",
    why: "The heavy last. Concrete, night shift.",
    title: "Takes a beating.",
    line: "Loading bay. Dusk. A boot that does not ask for a clean floor.",
    meta: "From the book  ·  45xxx",
    still: "/film/combat.jpg",
    video: "/film/combat.mp4",
  },
  {
    id: "zip",
    last: "The zip boot",
    why: "On and off without a scene.",
    title: "The zip is the point.",
    line: "A doorway at dusk. Warm light leaking out. In, then gone.",
    meta: "From the book  ·  45xxx",
    still: "/film/zip.jpg",
    video: "/film/zip.mp4",
  },
  {
    id: "wool",
    last: "The wool-lined",
    why: "Lining is for June mornings.",
    title: "Highveld frost.",
    line: "A cuff of wool. A fire. The window still iced from the night.",
    meta: "From R699  ·  45xxx",
    still: "/film/wool.jpg",
    video: "/film/wool.mp4",
  },
  {
    id: "book",
    last: "The book",
    why: "Ninety-two pairs. Confirm, then send.",
    title: "Order the 45xxx.",
    line: "Vellies, golfers, chelseas, derbies, loafers, sandals, hiking, combat, zip, wool-lined. We confirm the pair is on the bench. Then EFT.",
    meta: "Order. Confirm. Send.",
    still: "/film/book.jpg",
    video: "/film/book.mp4",
  },
];

export const LAST_THEMES: LastTheme[] = [
  {
    id: "vellie",
    beats: [
      {
        still: "/film/vellie.jpg",
        video: "/film/vellie.mp4",
        title: "Tuesday dirt.",
        line: "Karoo dust. A crease that knows the road.",
        fit: "52% 42%",
      },
      {
        still: "/film/vellie-b.jpg",
        video: "/film/vellie-b.mp4",
        title: "The farm road.",
        line: "Two-tone hide. Cracked red dirt. A last that knows the fence line.",
        fit: "50% 72%",
      },
      {
        still: "/film/vellie-c.jpg",
        video: "/film/vellie-c.mp4",
        title: "Blue hour.",
        line: "Grey hide. A stoep. The windmill still turning.",
        fit: "50% 68%",
      },
    ],
  },
  {
    id: "golfer",
    beats: [
      {
        still: "/film/golfer.jpg",
        video: "/film/golfer.mp4",
        title: "Crepe. Saturday.",
        line: "Tan hide. A pale sole on kikuyu. Coastal light.",
        fit: "50% 72%",
      },
      {
        still: "/film/golfer-b.jpg",
        video: "/film/golfer-b.mp4",
        title: "The veranda.",
        line: "White and stone. Crepe on the lawn. A Saturday, not a runway.",
        fit: "50% 68%",
      },
    ],
  },
  {
    id: "chelsea",
    beats: [
      {
        still: "/film/chelsea.jpg",
        video: "/film/chelsea.mp4",
        title: "Keep their line.",
        line: "Black hide. Wet city. The boot that does not slouch.",
        fit: "48% 70%",
      },
      {
        still: "/film/chelsea-b.jpg",
        video: "/film/chelsea-b.mp4",
        title: "Rain on the curb.",
        line: "Brown hide. Headlights on wet leather. The line holds.",
        fit: "50% 72%",
      },
    ],
  },
  {
    id: "derby",
    beats: [
      {
        still: "/film/derby.jpg",
        video: "/film/derby.mp4",
        title: "The work pair.",
        line: "Tan hide. Open lacing. A brick stoep at morning.",
        fit: "50% 72%",
      },
      {
        still: "/film/derby-b.jpg",
        video: "/film/derby-b.mp4",
        title: "On the bench.",
        line: "Dark hide. Morning work light. The last, as cut.",
        fit: "50% 70%",
      },
    ],
  },
  {
    id: "loafer",
    beats: [
      {
        still: "/film/loafer.jpg",
        video: "/film/loafer.mp4",
        title: "Afternoon shade.",
        line: "Penny strap. Oak. Stellenbosch, not a boardroom.",
        fit: "50% 72%",
      },
    ],
  },
  {
    id: "sandal",
    beats: [
      {
        still: "/film/sandal.jpg",
        video: "/film/sandal.mp4",
        title: "Salt. Late sun.",
        line: "Two straps. Pale sand. The Indian Ocean out of focus.",
        fit: "50% 72%",
      },
      {
        still: "/film/sandal-b.jpg",
        video: "/film/sandal-b.mp4",
        title: "The tide.",
        line: "A thong on wet rock. Water coming in. The last does not hurry.",
        fit: "50% 72%",
      },
    ],
  },
  {
    id: "hiking",
    beats: [
      {
        still: "/film/hiking.jpg",
        video: "/film/hiking.mp4",
        title: "First light.",
        line: "Drakensberg trail. Dew on the leather before the climb.",
        fit: "48% 70%",
      },
    ],
  },
  {
    id: "combat",
    beats: [
      {
        still: "/film/combat.jpg",
        video: "/film/combat.mp4",
        title: "Takes a beating.",
        line: "Loading bay. Dusk. A boot that does not ask for a clean floor.",
        fit: "50% 70%",
      },
    ],
  },
  {
    id: "zip",
    beats: [
      {
        still: "/film/zip.jpg",
        video: "/film/zip.mp4",
        title: "The zip is the point.",
        line: "A doorway at dusk. Warm light leaking out.",
        fit: "50% 72%",
      },
    ],
  },
  {
    id: "wool",
    beats: [
      {
        still: "/film/wool.jpg",
        video: "/film/wool.mp4",
        title: "Highveld frost.",
        line: "The wool boot. June morning. The grass still iced.",
        fit: "48% 70%",
      },
      {
        still: "/film/wool-b.jpg",
        video: "/film/wool-b.mp4",
        title: "The window still iced.",
        line: "A wool-lined vellie. Fire across the room. The lining is the point.",
        fit: "50% 70%",
      },
    ],
  },
  {
    id: "kids",
    beats: [
      {
        still: "/film/kids.jpg",
        video: "/film/kids.mp4",
        title: "Small last.",
        line: "A kids vellie. Karoo dirt. Built like the rest.",
        fit: "50% 72%",
      },
      {
        still: "/film/kids-b.jpg",
        video: "/film/kids-b.mp4",
        title: "The stoep.",
        line: "A kids derby. Late sun. No hurry.",
        fit: "50% 72%",
      },
    ],
  },
];

const THEME_BY_ID = Object.fromEntries(LAST_THEMES.map((t) => [t.id, t])) as Record<LastId, LastTheme>;
const FALLBACK_THEME = THEME_BY_ID.vellie;

export function themeForLook(look: string): LastTheme {
  const n = look.toLowerCase();
  if (n.startsWith("kids")) return THEME_BY_ID.kids;
  if (n.includes("wool")) return THEME_BY_ID.wool;
  if (n.includes("hiking")) return THEME_BY_ID.hiking;
  if (n.includes("combat")) return THEME_BY_ID.combat;
  if (n.includes("zip")) return THEME_BY_ID.zip;
  if (n.includes("golfer")) return THEME_BY_ID.golfer;
  if (n.includes("chelsea")) return THEME_BY_ID.chelsea;
  if (n.includes("derby")) return THEME_BY_ID.derby;
  if (n.includes("loafer")) return THEME_BY_ID.loafer;
  if (n.includes("sandal") || n.includes("thong")) return THEME_BY_ID.sandal;
  return FALLBACK_THEME;
}

export const ORDER_LASTS = [
  "Vellie",
  "Golfer",
  "Chelsea",
  "Derby",
  "Loafer",
  "Sandal",
  "Hiking",
  "Combat",
  "Zip boot",
  "Wool-lined",
] as const;

export const SCROLL_PER_CHAPTER = 1.55;
