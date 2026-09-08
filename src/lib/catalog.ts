import { filmSrc } from "./film";

export type Pair = {
  n: number;
  sku: string;
  look: string;
  price: number;
  img: string;
  card: string;
  views: string[];
  fromBook?: boolean;
};

const PHOTO = "https://raw.githubusercontent.com/lensleyluan001-create/sable-looks/main/";

/** Local book photos — shown instead of the GitHub crop when we have the page. */
const FROM_BOOK: Record<number, { img: string; card: string }> = {
  8: { img: "/pairs/45008.jpg", card: "/pairs/45008-card.jpg" },
};

const RAW: [number, string, number][] = [
  [1, "Vellie", 599],
  [2, "Vellie", 649],
  [3, "Vellie", 599],
  [4, "Golfer", 1200],
  [5, "Vellie", 699],
  [6, "Vellie", 599],
  [7, "Vellie", 649],
  [8, "Wool-lined boot", 799],
  [9, "Wool-lined boot", 799],
  [10, "Wool-lined slipper", 699],
  [11, "Hiking boot", 799],
  [12, "Vellie", 649],
  [13, "Derby", 599],
  [14, "Derby", 799],
  [15, "Chelsea", 1100],
  [16, "Vellie", 599],
  [17, "Vellie", 799],
  [18, "Vellie", 699],
  [19, "Vellie", 699],
  [20, "Derby", 599],
  [21, "Derby", 599],
  [22, "Derby", 799],
  [23, "Golfer", 999],
  [24, "Derby", 599],
  [25, "Derby", 599],
  [26, "Derby", 599],
  [27, "Sandal", 449],
  [28, "Thong", 449],
  [29, "Thong", 449],
  [30, "Sandal", 449],
  [31, "Derby", 649],
  [32, "Zip boot", 899],
  [33, "Derby", 599],
  [34, "Derby", 599],
  [35, "Derby", 599],
  [36, "Vellie", 649],
  [37, "Vellie", 649],
  [38, "Vellie", 649],
  [39, "Chelsea", 1100],
  [40, "Chelsea", 1100],
  [41, "Derby", 649],
  [42, "Derby", 599],
  [43, "Loafer", 699],
  [44, "Vellie", 649],
  [45, "Vellie", 699],
  [46, "Vellie", 699],
  [47, "Golfer", 850],
  [48, "Vellie", 699],
  [49, "Thong", 449],
  [50, "Vellie", 699],
  [51, "Vellie", 699],
  [52, "Vellie", 699],
  [53, "Vellie", 699],
  [54, "Vellie", 699],
  [55, "Vellie", 649],
  [56, "Hiking boot", 799],
  [57, "Wool-lined vellie", 799],
  [58, "Vellie", 699],
  [59, "Vellie", 799],
  [60, "Golfer", 1100],
  [61, "Hiking boot", 799],
  [62, "Vellie", 699],
  [63, "Golfer", 1300],
  [64, "Vellie", 699],
  [65, "Combat boot", 1400],
  [66, "Combat boot", 1400],
  [67, "Combat boot", 1400],
  [68, "Combat boot", 1200],
  [69, "Chelsea", 1100],
  [70, "Chelsea", 1100],
  [71, "Chelsea", 1100],
  [72, "Chelsea", 1100],
  [73, "Chelsea", 1100],
  [74, "Chelsea", 1100],
  [75, "Chelsea", 1100],
  [76, "Chelsea", 1100],
  [77, "Chelsea", 1100],
  [78, "Kids vellie", 399],
  [79, "Kids derby", 399],
  [80, "Hiking boot", 1400],
  [81, "Hiking boot", 899],
  [82, "Hiking boot", 1400],
  [83, "Hiking boot", 1400],
  [84, "Hiking boot", 1400],
  [85, "Hiking boot", 1400],
  [86, "Hiking boot", 1400],
  [87, "Vellie", 699],
  [88, "Combat boot", 1600],
  [89, "Vellie", 699],
  [90, "Golfer", 1200],
  [91, "Zip boot", 799],
  [92, "Vellie", 699],
];

export const PAIRS: Pair[] = RAW.map(([n, look, price]) => {
  const sku = String(45000 + n);
  const views = [1, 2, 3, 4, 5].map((i) => `${PHOTO}views/${sku}-${i}.jpg`);
  const local = FROM_BOOK[n];
  return {
    n,
    sku,
    look,
    price,
    img: local?.img ?? views[0],
    card: local?.card ?? views[0],
    views,
    fromBook: Boolean(local),
  };
});

export const FEATURED = PAIRS.find((p) => p.n === 15) ?? PAIRS[0];

export type ShopFilter = { id: string; looks: string[] | null };

export const SHOP_FILTERS: ShopFilter[] = [
  { id: "All", looks: null },
  { id: "Vellies", looks: ["Vellie", "Wool-lined vellie"] },
  { id: "Golfers", looks: ["Golfer"] },
  { id: "Boots", looks: ["Chelsea", "Hiking boot", "Combat boot", "Zip boot", "Wool-lined boot"] },
  { id: "Derbies", looks: ["Derby", "Loafer"] },
  { id: "Sandals", looks: ["Sandal", "Thong"] },
  { id: "Kids", looks: ["Kids vellie", "Kids derby"] },
];

export function displayLook(look: string): string {
  if (look === "Thong") return "Sandal";
  if (look === "Wool-lined boot") return "Wool boot";
  if (look === "Wool-lined slipper") return "Wool slipper";
  if (look === "Wool-lined vellie") return "Wool vellie";
  return look;
}

export function pairTitle(pair: Pair): string {
  return displayLook(pair.look);
}

export const HIDES = [
  "As photographed",
  "Tan",
  "Brown",
  "Dark brown",
  "Black",
  "Olive",
] as const;

export const TWO_TONE_SKU = "45090";

const GOLF_TT =
  "https://raw.githubusercontent.com/lensleyluan001-create/sable-looks/228b3ecc0b399b23dc209db335889c7fc4a708d6/golf/tt/";

export const GOLF_TONES: { id: string; label: string; a: string; b: string; photo?: string }[] = [
  { id: "As photographed", label: "As photographed", a: "#c4a574", b: "#c4a574" },
  { id: "tt:white-stone", label: "White / Stone", a: "#f3eee6", b: "#b7a89a", photo: `${GOLF_TT}white-stone.jpg` },
  { id: "tt:white-red", label: "White / Red", a: "#f3eee6", b: "#b4232a", photo: `${GOLF_TT}white-red.jpg` },
  { id: "tt:white-olive", label: "White / Olive", a: "#f3eee6", b: "#5c6848", photo: `${GOLF_TT}white-olive.jpg` },
  { id: "tt:navy-navy", label: "Navy", a: "#1e3a5f", b: "#1e3a5f", photo: `${GOLF_TT}navy-navy.jpg` },
  { id: "tt:tan-teal", label: "Tan / Teal", a: "#c4a574", b: "#1f6f6a", photo: `${GOLF_TT}tan-teal.jpg` },
  { id: "tt:white-pink", label: "White / Pink", a: "#f3eee6", b: "#d4a3a0", photo: `${GOLF_TT}white-pink.jpg` },
  { id: "tt:cream-wine", label: "Cream / Wine", a: "#eadcc4", b: "#7a1f2b", photo: `${GOLF_TT}cream-wine.jpg` },
  { id: "tt:pink-cream", label: "Pink / Cream", a: "#d4a3a0", b: "#eadcc4", photo: `${GOLF_TT}pink-cream.jpg` },
  { id: "tt:white-navy", label: "White / Navy", a: "#f3eee6", b: "#1e3a5f", photo: `${GOLF_TT}white-navy.jpg` },
  { id: "tt:white-sky", label: "White / Sky", a: "#f3eee6", b: "#6e8aa8", photo: `${GOLF_TT}white-sky.jpg` },
  { id: "tt:white-brown", label: "White / Brown", a: "#f3eee6", b: "#5a3a28", photo: `${GOLF_TT}white-brown.jpg` },
  { id: "tt:tan-tan", label: "Tan", a: "#c4a574", b: "#c4a574", photo: `${GOLF_TT}tan-tan.jpg` },
  { id: "tt:white-white", label: "White", a: "#f3eee6", b: "#f3eee6", photo: `${GOLF_TT}white-white.jpg` },
  { id: "tt:pink-pink", label: "Pink", a: "#d4a3a0", b: "#d4a3a0", photo: `${GOLF_TT}pink-pink.jpg` },
  { id: "tt:white-leopard", label: "White / Leopard", a: "#f3eee6", b: "#8a5a2b", photo: `${GOLF_TT}white-leopard.jpg` },
  { id: "tt:brown-white", label: "Brown / White", a: "#5a3a28", b: "#f3eee6", photo: `${GOLF_TT}brown-white.jpg` },
  { id: "tt:wine-cream", label: "Wine / Cream", a: "#7a1f2b", b: "#eadcc4", photo: `${GOLF_TT}wine-cream.jpg` },
  { id: "tt:tan-sky", label: "Tan / Sky", a: "#c4a574", b: "#6e8aa8", photo: `${GOLF_TT}tan-sky.jpg` },
];

export function isTwoToneSku(sku: string): boolean {
  return sku === TWO_TONE_SKU;
}

export const HIDE_SWATCH: Record<(typeof HIDES)[number], string> = {
  "As photographed": "#8a7a68",
  Tan: "#c4a574",
  Brown: "#6b4634",
  "Dark brown": "#3a2418",
  Black: "#14110e",
  Olive: "#5a6348",
};

export const HIDE_FILTER: Record<(typeof HIDES)[number], string> = {
  "As photographed": "",
  Tan: "hide-tan",
  Brown: "hide-brown",
  "Dark brown": "hide-dark",
  Black: "hide-black",
  Olive: "hide-olive",
};

export type ExtraId = "laces" | "stitch" | "elastic" | "sole" | "lining" | "hardware" | "laser";

export const EXTRAS: { id: ExtraId; label: string; price: number }[] = [
  { id: "laces", label: "Laces", price: 50 },
  { id: "stitch", label: "Stitching", price: 50 },
  { id: "elastic", label: "Elastic", price: 50 },
  { id: "sole", label: "Sole", price: 50 },
  { id: "lining", label: "Lining", price: 50 },
  { id: "hardware", label: "Hardware", price: 50 },
  { id: "laser", label: "Laser mark", price: 50 },
];

export function extraPrice(ids: string[]): number {
  return ids.reduce((sum, id) => sum + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0);
}

export function extraLabel(id: string): string {
  const hit = EXTRAS.find((e) => e.id === id);
  return hit ? `${hit.label} · R${hit.price}` : id;
}

export function lacedLook(look: string): boolean {
  return /vellie|golfer|derby|hiking|combat|wool-lined boot|zip/i.test(look);
}

export function extrasFor(look: string): { id: ExtraId; label: string; price: number }[] {
  const n = look.toLowerCase();
  const allow = new Set<ExtraId>(["stitch", "laser", "sole"]);
  if (lacedLook(look)) {
    allow.add("laces");
    allow.add("hardware");
  }
  if (/zip/.test(n)) allow.add("hardware");
  if (!/sandal|thong/.test(n)) allow.add("lining");
  if (/vellie|chelsea/.test(n)) allow.add("elastic");
  return EXTRAS.filter((e) => allow.has(e.id));
}

export const UK_EU: Record<string, string> = {
  "3": "35.5",
  "4": "37",
  "5": "38",
  "6": "39",
  "7": "41",
  "8": "42",
  "9": "43",
  "10": "44.5",
  "11": "46",
  "12": "47",
  "13": "48.5",
};

export const KIDS_UK_EU: Record<string, string> = {
  "10": "28",
  "11": "29",
  "12": "31",
  "13": "32",
  "1": "33",
  "2": "34",
  "3": "35.5",
  "4": "37",
  "5": "38",
};

export function sizesFor(look: string): string[] {
  if (look.startsWith("Kids")) {
    return ["10", "11", "12", "13", "1", "2", "3", "4", "5"];
  }
  return Array.from({ length: 12 }, (_, i) => String(i + 4));
}

export function defaultSize(look: string): string {
  return look.startsWith("Kids") ? "2" : "8";
}

export function sizeLabel(look: string, uk: string): string {
  const eu = look.startsWith("Kids") ? KIDS_UK_EU[uk] : UK_EU[uk];
  return eu ? `UK ${uk} · EU ${eu}` : `UK ${uk}`;
}

export function lookStill(look: string): string {
  const name = look.toLowerCase();
  let path = "/film/vellie.jpg";
  if (name.startsWith("kids")) path = "/film/kids.jpg";
  else if (name.includes("wool")) path = "/film/wool.jpg";
  else if (name.includes("hiking")) path = "/film/hiking.jpg";
  else if (name.includes("combat")) path = "/film/combat.jpg";
  else if (name.includes("zip")) path = "/film/zip.jpg";
  else if (name.includes("golfer")) path = "/film/golfer.jpg";
  else if (name.includes("chelsea")) path = "/film/chelsea.jpg";
  else if (name.includes("derby")) path = "/film/derby.jpg";
  else if (name.includes("loafer")) path = "/film/loafer.jpg";
  else if (name.includes("sandal") || name.includes("thong")) path = "/film/sandal.jpg";
  return filmSrc(path);
}

export function pairPhotos(pair: Pair): { src: string; alt: string; kind: "pair" | "last" }[] {
  const slides = pair.views.map((src, i) => ({
    src,
    alt: `${pairTitle(pair)} — photo ${i + 1}`,
    kind: "pair" as const,
  }));
  if (pair.fromBook && pair.img && !slides.some((s) => s.src === pair.img)) {
    slides.unshift({ src: pair.img, alt: `${pairTitle(pair)} from the bench`, kind: "pair" });
  }
  return slides;
}

export function pairBySku(sku: string): Pair | undefined {
  return PAIRS.find((p) => p.sku === sku);
}

export function defaultPairFor(look: string): Pair {
  return PAIRS.find((p) => p.look === look) ?? PAIRS[0];
}
