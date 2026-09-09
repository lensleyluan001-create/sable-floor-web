import {
  HIDE_SWATCH,
  PAIRS,
  defaultSize,
  displayLook,
  extrasFor,
  pairBySku,
  type ExtraId,
  type Pair,
} from "@/lib/catalog";
import type { LaserKind, LaserPlace } from "@/lib/laser";
import { laserExtra, type LaserMark } from "@/lib/laser";

export type Swatch = { id: string; label: string; swatch: string };

export const MORE_HIDES: Swatch[] = [
  { id: "grey", label: "Grey", swatch: "#8a8880" },
  { id: "navy", label: "Navy", swatch: "#1e3a5f" },
  { id: "white", label: "White", swatch: "#f3eee6" },
  { id: "cream", label: "Cream", swatch: "#eadcc4" },
  { id: "wine", label: "Wine", swatch: "#7a1f2b" },
];

export const STITCH_COLS: Swatch[] = [
  { id: "cream", label: "Cream", swatch: "#eadcc4" },
  { id: "tan", label: "Tan", swatch: "#c4a574" },
  { id: "brown", label: "Brown", swatch: "#6b4634" },
  { id: "black", label: "Black", swatch: "#14110e" },
  { id: "olive", label: "Olive", swatch: "#5a6348" },
  { id: "white", label: "White", swatch: "#f3eee6" },
  { id: "aqua", label: "Aqua", swatch: "#2f8f86" },
  { id: "navy", label: "Navy", swatch: "#1e3a5f" },
];

export const LACE_COLS: Swatch[] = [
  { id: "natural", label: "Rawhide", swatch: "#cbb89a" },
  { id: "tan", label: "Tan", swatch: "#c4a574" },
  { id: "brown", label: "Brown", swatch: "#6b4634" },
  { id: "black", label: "Black", swatch: "#14110e" },
  { id: "olive", label: "Olive", swatch: "#5a6348" },
  { id: "white", label: "White", swatch: "#f3eee6" },
  { id: "aqua", label: "Aqua", swatch: "#2f8f86" },
  { id: "navy", label: "Navy", swatch: "#1e3a5f" },
];

export const ELASTIC_COLS = STITCH_COLS;

export const SOLE_OPTS: Swatch[] = [
  { id: "leather", label: "Leather", swatch: "#5a3a28" },
  { id: "crepe", label: "Crepe", swatch: "#d4c4a0" },
  { id: "rubber", label: "Rubber", swatch: "#2a2a28" },
  { id: "commando", label: "Commando", swatch: "#3a3830" },
];

export const LINING_OPTS: Swatch[] = [
  { id: "leather", label: "Leather", swatch: "#6b4634" },
  { id: "wool", label: "Wool", swatch: "#d8cfc3" },
];

export const HARDWARE_OPTS: Swatch[] = [
  { id: "brass", label: "Brass", swatch: "#b08a4f" },
  { id: "black", label: "Black", swatch: "#1a1612" },
  { id: "nickel", label: "Nickel", swatch: "#c5c1b7" },
];

export const MORE_HIDE_FILTER: Record<string, string> = {
  Grey: "hide-grey",
  Navy: "hide-navy",
  White: "hide-white",
  Cream: "hide-cream",
  Wine: "hide-wine",
};

export const CLERK_DEFAULT_SKU = "45001";

const LOOK_DEFAULT_SKU: Record<string, string> = {
  Vellie: "45001",
  Golfer: "45004",
  Chelsea: "45015",
  Derby: "45013",
  Loafer: "45043",
  Sandal: "45027",
  Thong: "45028",
  "Hiking boot": "45011",
  "Combat boot": "45065",
  "Zip boot": "45032",
  "Wool-lined boot": "45008",
  "Wool-lined slipper": "45010",
  "Wool-lined vellie": "45057",
  "Kids vellie": "45078",
  "Kids derby": "45079",
};

export const CLERK_LASTS = [
  "Vellie",
  "Golfer",
  "Chelsea",
  "Derby",
  "Loafer",
  "Sandal",
  "Hiking boot",
  "Combat boot",
  "Zip boot",
  "Wool-lined boot",
] as const;

const LOOK_WORDS: [RegExp, string][] = [
  [/\bkids?\s*derby\b/, "Kids derby"],
  [/\bkids?\s*vellie\b/, "Kids vellie"],
  [/\bwool[-\s]*lined\s*slipper\b|\bslipper\b/, "Wool-lined slipper"],
  [/\bwool[-\s]*lined\s*vellie\b/, "Wool-lined vellie"],
  [/\bwool[-\s]*lined\b|\bwool\s*boot\b/, "Wool-lined boot"],
  [/\bchelsea\b/, "Chelsea"],
  [/\bhiking\b|\btrail\s*boot\b/, "Hiking boot"],
  [/\bcombat\b/, "Combat boot"],
  [/\bzip\s*boot\b|\bwith a zip\b/, "Zip boot"],
  [/\bgolfer\b|\bgolf\s*shoe\b/, "Golfer"],
  [/\bloafer\b|\bpenny\b/, "Loafer"],
  [/\bsandal\b|\bthong\b/, "Sandal"],
  [/\bderby\b/, "Derby"],
  [/\bvellie\b|\bveldskoen\b|\bvelskoen\b|\bdesert\s*boot\b/, "Vellie"],
];

export type Brief = {
  hideLabel?: string;
  stitchId?: string;
  stitchLabel?: string;
  laceId?: string;
  laceLabel?: string;
  elasticId?: string;
  elasticLabel?: string;
  soleId?: string;
  soleLabel?: string;
  liningId?: string;
  liningLabel?: string;
  hardwareId?: string;
  hardwareLabel?: string;
  laser?: boolean;
  laserKind?: LaserKind;
  laserText?: string;
  laserPlace?: LaserPlace;
  look?: string;
  sku?: string;
  size?: string;
  spoken: string;
  refuseDesign?: boolean;
  clear?: ExtraId[];
};

export type SpecDraft = {
  hide: string;
  extras: ExtraId[];
  stitchId: string;
  laceId: string;
  elasticId: string;
  soleId: string;
  liningId: string;
  hardwareId: string;
  laserKind: LaserKind;
  laserText: string;
  laserPlace: LaserPlace;
  size: string;
  note: string;
};

export type ClerkPatch = {
  reply: string;
  sku?: string | null;
  hide?: string | null;
  stitch?: string | null;
  laces?: string | null;
  elastic?: string | null;
  sole?: string | null;
  lining?: string | null;
  hardware?: string | null;
  laser?: { kind: LaserKind; text: string; place: LaserPlace } | null;
  size?: string | null;
  refuseDesign?: boolean;
  clear?: ExtraId[];
};

const HIDE_WORDS: [RegExp, string][] = [
  [/\bdark\s*brown\b/, "Dark brown"],
  [/\bas photographed\b|\bin the book\b/, "As photographed"],
  [/\bcharcoal\b|\bgre[ya]\b/, "Grey"],
  [/\bnavy\b/, "Navy"],
  [/\boff[-\s]?white\b|\bwhite\b/, "White"],
  [/\bcream\b/, "Cream"],
  [/\bwine\b|\bburgundy\b/, "Wine"],
  [/\bolive\b|\bkhaki\b/, "Olive"],
  [/\bblack\b/, "Black"],
  [/\bbrown\b/, "Brown"],
  [/\btan\b/, "Tan"],
];

function windowAround(text: string, re: RegExp): string {
  const m = text.match(re);
  if (!m || m.index == null) return "";
  return text.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20);
}

function swatchLabel(list: Swatch[], id: string): string {
  return list.find((c) => c.id === id)?.label ?? id;
}

export function stitchSwatch(id: string): string {
  return STITCH_COLS.find((c) => c.id === id)?.swatch ?? "#eadcc4";
}

export function stitchLabelOf(id: string): string {
  return swatchLabel(STITCH_COLS, id);
}

export function laceLabelOf(id: string): string {
  return swatchLabel(LACE_COLS, id);
}

export function hideSwatch(label: string): string {
  if (label in HIDE_SWATCH) return HIDE_SWATCH[label as keyof typeof HIDE_SWATCH];
  return MORE_HIDES.find((h) => h.label === label)?.swatch ?? "#8a7a68";
}

export function hideToneClass(hide: string): string {
  return MORE_HIDE_FILTER[hide] || "";
}

export function pairForLook(look: string): Pair {
  const sku = LOOK_DEFAULT_SKU[look];
  return pairBySku(sku) ?? PAIRS.find((p) => p.look === look) ?? PAIRS[0];
}

export function clerkPair(sku?: string | null, look?: string | null): Pair {
  if (sku) {
    const hit = pairBySku(sku);
    if (hit) return hit;
  }
  if (look) return pairForLook(look);
  return pairBySku(CLERK_DEFAULT_SKU) ?? PAIRS[0];
}

export function emptyDraft(look: string): SpecDraft {
  return {
    hide: "As photographed",
    extras: [],
    stitchId: "cream",
    laceId: "natural",
    elasticId: "cream",
    soleId: /golfer/i.test(look) ? "crepe" : /hiking|combat/i.test(look) ? "commando" : "leather",
    liningId: /wool/i.test(look) ? "wool" : "leather",
    hardwareId: "brass",
    laserKind: "Initials",
    laserText: "",
    laserPlace: "Heel",
    size: defaultSize(look),
    note: "",
  };
}

export function parseBrief(raw: string): Brief {
  const text = String(raw || "")
    .toLowerCase()
    .replace(/\bgray\b/g, "grey");
  const out: Brief = { spoken: "" };
  if (!text.trim()) return out;

  if (
    /\bredesign\b|\bnew last\b|\bnew shape\b|\bsneaker\b|\btrainer\b|\binvent\b|\bgenerate (a |the )?shoe\b|\bdraw (me |a )?shoe\b/.test(
      text,
    )
  ) {
    out.refuseDesign = true;
  }

  const stitchCue = /\bstitch|\bthread|\bseam/;
  const laceCue = /\blace/;
  const elasticCue = /\belastic\b|\bgusset\b/;
  const hideCue = /\bhide|\bleather|\bupper|\bcolour|\bcolor|\bshoe\b|\bpair\b/;
  const hardwareCue = /\beyelet|\bhardware|\bzip\s*pull|\bbuckle|\bstud/;

  const clear: ExtraId[] = [];
  const drop = text.match(
    /\b(?:no|without|remove|skip|drop|plain)\b.{0,24}\b(laces?|stitch(?:ing)?|laser|sole|lining|elastic|hardware|eyelets?)\b/g,
  );
  if (drop) {
    for (const bit of drop) {
      if (/lace/.test(bit)) clear.push("laces");
      else if (/stitch/.test(bit)) clear.push("stitch");
      else if (/laser/.test(bit)) clear.push("laser");
      else if (/sole/.test(bit)) clear.push("sole");
      else if (/lining/.test(bit)) clear.push("lining");
      else if (/elastic/.test(bit)) clear.push("elastic");
      else if (/hardware|eyelet/.test(bit)) clear.push("hardware");
    }
  }
  if (clear.length) out.clear = [...new Set(clear)];

  if (/\baqua\b|\bteal\b|\bturquoise\b/.test(text)) {
    if (laceCue.test(text) && !stitchCue.test(text)) {
      out.laceId = "aqua";
      out.laceLabel = "Aqua";
    } else if (elasticCue.test(text) && !stitchCue.test(text)) {
      out.elasticId = "aqua";
      out.elasticLabel = "Aqua";
    } else {
      out.stitchId = "aqua";
      out.stitchLabel = "Aqua";
    }
  }
  if (!out.stitchId) {
    for (const col of STITCH_COLS) {
      const re = new RegExp(`\\b${col.label.toLowerCase()}\\b`);
      if (!re.test(text)) continue;
      const around = windowAround(text, re);
      if (stitchCue.test(around) || stitchCue.test(text)) {
        out.stitchId = col.id;
        out.stitchLabel = col.label;
        break;
      }
    }
  }

  if (!out.laceId) {
    for (const col of LACE_COLS) {
      const re = new RegExp(`\\b${col.id === "natural" ? "rawhide|natural" : col.label.toLowerCase()}\\b`);
      if (!re.test(text)) continue;
      if (laceCue.test(windowAround(text, re)) || laceCue.test(text)) {
        out.laceId = col.id;
        out.laceLabel = col.label;
        break;
      }
    }
  }

  if (!out.elasticId) {
    for (const col of ELASTIC_COLS) {
      const re = new RegExp(`\\b${col.label.toLowerCase()}\\b`);
      if (!re.test(text)) continue;
      if (elasticCue.test(windowAround(text, re)) || elasticCue.test(text)) {
        out.elasticId = col.id;
        out.elasticLabel = col.label;
        break;
      }
    }
  }

  if (/\bcrepe\b/.test(text)) {
    out.soleId = "crepe";
    out.soleLabel = "Crepe";
  } else if (/\bcommando\b/.test(text)) {
    out.soleId = "commando";
    out.soleLabel = "Commando";
  } else if (/\brubber\b|\bvibram\b/.test(text)) {
    out.soleId = "rubber";
    out.soleLabel = "Rubber";
  } else if (/\bleather\s+sole\b|\bsole\s+(?:in\s+)?leather\b/.test(text)) {
    out.soleId = "leather";
    out.soleLabel = "Leather";
  }

  if (/\bwool\s+lin|\blined in wool\b|\bwool\s+cuff\b|\bwool lining\b/.test(text)) {
    out.liningId = "wool";
    out.liningLabel = "Wool";
  } else if (/\bleather\s+lin|\blined in leather\b|\bleather lining\b/.test(text)) {
    out.liningId = "leather";
    out.liningLabel = "Leather";
  }

  if (/\bbrass\b/.test(text)) {
    out.hardwareId = "brass";
    out.hardwareLabel = "Brass";
  } else if (/\bnickel\b|\bsilver\s+eye/.test(text)) {
    out.hardwareId = "nickel";
    out.hardwareLabel = "Nickel";
  } else if (/\bblack\s+(eyelet|hardware|zip|pull)s?\b/.test(text) || (hardwareCue.test(text) && /\bblack\b/.test(text))) {
    out.hardwareId = "black";
    out.hardwareLabel = "Black";
  }

  for (const [re, label] of HIDE_WORDS) {
    if (!re.test(text)) continue;
    const around = windowAround(text, re);
    if (out.stitchLabel && label.toLowerCase() === out.stitchLabel.toLowerCase() && !hideCue.test(text)) continue;
    if (out.laceLabel && label.toLowerCase() === out.laceLabel.toLowerCase() && laceCue.test(around) && !hideCue.test(around))
      continue;
    if (out.elasticLabel && label.toLowerCase() === out.elasticLabel.toLowerCase() && elasticCue.test(around)) continue;
    if (out.hardwareLabel && label.toLowerCase() === out.hardwareLabel.toLowerCase() && hardwareCue.test(around)) continue;
    if (out.stitchId && stitchCue.test(around) && !hideCue.test(around)) continue;
    if (laceCue.test(around) && !hideCue.test(around) && !hideCue.test(text)) continue;
    out.hideLabel = label;
    break;
  }

  if (/\blaser\b|\binitial|\bmonogram|\blogo\b/.test(text)) out.laser = true;

  if (/\blogo\b/.test(text)) out.laserKind = "Logo";
  else if (/\binitial/.test(text) || /\bmonogram\b/.test(text)) out.laserKind = "Initials";
  else if (/\bname\b/.test(text) && out.laser) out.laserKind = "Name";

  const initials =
    text.match(/\b(?:initials?|monogram)\s+([a-z]{1,4})\b/) ||
    text.match(/\b([a-z]{2,4})\s+on the (?:heel|quarter|vamp)\b/);
  if (initials && out.laser) {
    out.laserKind = out.laserKind ?? "Initials";
    if (initials[1] && !/heel|vamp|name|logo/.test(initials[1])) {
      out.laserText = initials[1].toUpperCase();
    }
  }

  const named = text.match(/\bname\s+["']?([a-z][a-z]*(?:\s+[a-z]+)?)["']?/);
  if (named && out.laser && !/\bhide|stitch|lace|last|pair\b/.test(named[1])) {
    out.laserKind = "Name";
    out.laserText = named[1].replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const place = text.match(/\bon (?:the )?(heel|quarter|vamp)\b/);
  if (place) {
    out.laser = true;
    const p = place[1];
    out.laserPlace = (p.charAt(0).toUpperCase() + p.slice(1)) as LaserPlace;
  }

  const sku = text.match(/\b(45\d{3})\b/);
  if (sku) out.sku = sku[1];

  for (const [re, look] of LOOK_WORDS) {
    if (re.test(text)) {
      out.look = look;
      break;
    }
  }

  const size = text.match(/\buk\s*(\d{1,2})\b/) || text.match(/\bsize\s*(\d{1,2})\b/);
  if (size?.[1]) out.size = size[1];

  const bits: string[] = [];
  if (out.hideLabel && out.hideLabel !== "As photographed") bits.push(`${out.hideLabel} hide`);
  if (out.stitchLabel) bits.push(`${out.stitchLabel} stitch`);
  if (out.laceLabel) bits.push(`${out.laceLabel} laces`);
  if (out.elasticLabel) bits.push(`${out.elasticLabel} elastic`);
  if (out.soleLabel) bits.push(`${out.soleLabel} sole`);
  if (out.liningLabel) bits.push(`${out.liningLabel} lining`);
  if (out.hardwareLabel) bits.push(`${out.hardwareLabel} hardware`);
  if (out.laser) {
    const where = (out.laserPlace ?? "Heel").toLowerCase();
    if (out.laserKind === "Logo") bits.push(`laser logo on ${where}`);
    else if (out.laserText)
      bits.push(`laser ${out.laserKind === "Name" ? "name" : "initials"} "${out.laserText}" on ${where}`);
    else bits.push("laser");
  }
  if (out.refuseDesign) {
    out.spoken = "We keep this last. Hide, stitch, laces, sole, laser — that is the spec. We do not redraw the shape.";
  } else if (bits.length) {
    out.spoken = `${bits.join(". ").replace(/^\w/, (c) => c.toUpperCase())}. On this pair. We confirm before we cut.`;
  } else if (out.clear?.length) {
    out.spoken = "Taken off the spec. We confirm before we cut.";
  } else {
    out.spoken = "Written on the order as you typed it. We confirm before we cut.";
  }
  return out;
}

function briefBits(brief: Brief): string[] {
  const bits: string[] = [];
  if (brief.hideLabel && brief.hideLabel !== "As photographed") bits.push(`${brief.hideLabel} hide`);
  if (brief.stitchLabel) bits.push(`${brief.stitchLabel} stitch`);
  if (brief.laceLabel) bits.push(`${brief.laceLabel} laces`);
  if (brief.elasticLabel) bits.push(`${brief.elasticLabel} elastic`);
  if (brief.soleLabel) bits.push(`${brief.soleLabel} sole`);
  if (brief.liningLabel) bits.push(`${brief.liningLabel} lining`);
  if (brief.hardwareLabel) bits.push(`${brief.hardwareLabel} hardware`);
  if (brief.laser) {
    const where = (brief.laserPlace ?? "Heel").toLowerCase();
    if (brief.laserKind === "Logo") bits.push(`laser logo on ${where}`);
    else if (brief.laserText) {
      bits.push(`laser ${brief.laserKind === "Name" ? "name" : "initials"} "${brief.laserText}" on ${where}`);
    } else bits.push(`laser on ${where}`);
  }
  return bits;
}

export function clerkSpoken(brief: Brief, pair: Pair): string {
  if (brief.refuseDesign) {
    return "We keep this last. Hide, stitch, laces, sole, laser — that is the spec. We do not redraw the shape.";
  }
  const bits = briefBits(brief);
  const last = `This last — the ${displayLook(pair.look).toLowerCase()}. The shape stays.`;
  if (!bits.length && !brief.look && !brief.sku && !brief.size && !brief.clear?.length) {
    return `${last} Hide, stitch, laces, sole, laser — as you want them. We confirm before we cut.`;
  }
  const head = bits.length ? `${bits.join(". ").replace(/^\w/, (c) => c.toUpperCase())}. ` : "";
  const dropped = brief.clear?.length ? " Taken off as you asked." : "";
  const size = brief.size ? ` UK ${brief.size}.` : "";
  return `${head}${last}${size}${dropped} We confirm before we cut.`;
}

export function localClerk(raw: string, currentSku?: string): ClerkPatch {
  const brief = parseBrief(raw);
  const pair = clerkPair(brief.sku ?? (brief.look ? pairForLook(brief.look).sku : null), brief.look);
  const keepSku = brief.sku || brief.look ? pair.sku : currentSku || pair.sku;
  const shown = pairBySku(keepSku) ?? pair;
  return {
    reply: clerkSpoken(brief, shown),
    sku: brief.sku || brief.look ? shown.sku : null,
    hide: brief.hideLabel ?? null,
    stitch: brief.stitchId ?? null,
    laces: brief.laceId ?? null,
    elastic: brief.elasticId ?? null,
    sole: brief.soleId ?? null,
    lining: brief.liningId ?? null,
    hardware: brief.hardwareId ?? null,
    laser: brief.laser
      ? {
          kind: brief.laserKind ?? "Initials",
          text: brief.laserText ?? "",
          place: brief.laserPlace ?? "Heel",
        }
      : null,
    size: brief.size ?? null,
    refuseDesign: brief.refuseDesign,
    clear: brief.clear,
  };
}

export function applyClerkPatch(draft: SpecDraft, patch: ClerkPatch, look: string): SpecDraft {
  const allowed = new Set(extrasFor(look).map((e) => e.id));
  let extras = [...draft.extras];
  const on = (id: ExtraId) => {
    if (!allowed.has(id)) return;
    if (!extras.includes(id)) extras = [...extras, id];
  };
  if (patch.stitch) on("stitch");
  if (patch.laces) on("laces");
  if (patch.elastic) on("elastic");
  if (patch.sole) on("sole");
  if (patch.lining) on("lining");
  if (patch.hardware) on("hardware");
  if (patch.laser) on("laser");
  if (patch.clear?.length) extras = extras.filter((id) => !patch.clear!.includes(id));
  return {
    ...draft,
    hide: patch.hide || draft.hide,
    stitchId: patch.stitch || draft.stitchId,
    laceId: patch.laces || draft.laceId,
    elasticId: patch.elastic || draft.elasticId,
    soleId: patch.sole || draft.soleId,
    liningId: patch.lining || draft.liningId,
    hardwareId: patch.hardware || draft.hardwareId,
    laserKind: patch.laser?.kind ?? draft.laserKind,
    laserText: patch.laser ? patch.laser.text : draft.laserText,
    laserPlace: patch.laser?.place ?? draft.laserPlace,
    size: patch.size || draft.size,
    extras,
  };
}

export function specCaption(draft: SpecDraft): string {
  const bits: string[] = [];
  if (draft.size) bits.push(`UK ${draft.size}`);
  if (draft.hide && draft.hide !== "As photographed") bits.push(`${draft.hide} hide`);
  if (draft.extras.includes("stitch")) bits.push(`${stitchLabelOf(draft.stitchId)} stitch`);
  if (draft.extras.includes("laces")) bits.push(`${laceLabelOf(draft.laceId)} laces`);
  if (draft.extras.includes("elastic")) bits.push(`${swatchLabel(ELASTIC_COLS, draft.elasticId)} elastic`);
  if (draft.extras.includes("sole")) bits.push(`${swatchLabel(SOLE_OPTS, draft.soleId)} sole`);
  if (draft.extras.includes("lining")) bits.push(`${swatchLabel(LINING_OPTS, draft.liningId)} lining`);
  if (draft.extras.includes("hardware")) bits.push(`${swatchLabel(HARDWARE_OPTS, draft.hardwareId)} hardware`);
  if (draft.extras.includes("laser")) {
    const where = draft.laserPlace.toLowerCase();
    bits.push(draft.laserText ? `laser "${draft.laserText}" ${where}` : `laser ${where}`);
  }
  if (!bits.length) return "As photographed";
  const named = bits.filter((b) => !b.startsWith("UK "));
  if (!named.length) return `${bits[0]} selected`;
  return `${bits.join(" · ")} — photo stays this pair`;
}

export function orderSpecLine(draft: SpecDraft): string {
  if (draft.note.trim()) return draft.note.trim();
  const bits: string[] = [];
  if (draft.extras.includes("stitch")) bits.push(`Stitch ${stitchLabelOf(draft.stitchId)}`);
  if (draft.extras.includes("laces")) bits.push(`Laces ${laceLabelOf(draft.laceId)}`);
  if (draft.extras.includes("elastic")) bits.push(`Elastic ${swatchLabel(ELASTIC_COLS, draft.elasticId)}`);
  if (draft.extras.includes("sole")) bits.push(`Sole ${swatchLabel(SOLE_OPTS, draft.soleId)}`);
  if (draft.extras.includes("lining")) bits.push(`Lining ${swatchLabel(LINING_OPTS, draft.liningId)}`);
  if (draft.extras.includes("hardware")) bits.push(`Hardware ${swatchLabel(HARDWARE_OPTS, draft.hardwareId)}`);
  return bits.join(" · ");
}

export function orderExtrasPayload(draft: SpecDraft): string[] {
  const clean = draft.extras.slice();
  if (!clean.includes("laser")) return clean;
  const mark: LaserMark = { kind: draft.laserKind, text: draft.laserText, place: draft.laserPlace };
  return [...clean.filter((e) => e !== "laser"), "laser", laserExtra(mark)];
}

export function suggestionsFor(draft: SpecDraft, pair: Pair, locked: boolean): string[] {
  const out: string[] = [];
  if (!locked) {
    out.push("A vellie", "A golfer", "A chelsea", "A derby");
  }
  if (draft.hide === "As photographed") out.push("Grey hide", "Black hide", "Tan hide");
  if (!draft.extras.includes("stitch")) out.push("Aqua stitch", "Cream stitch");
  if (!draft.extras.includes("laces") && extrasFor(pair.look).some((e) => e.id === "laces")) {
    out.push("Black laces", "Rawhide laces");
  }
  if (!draft.extras.includes("elastic") && extrasFor(pair.look).some((e) => e.id === "elastic")) {
    out.push("Aqua elastic");
  }
  if (!draft.extras.includes("sole")) {
    out.push(/golfer/i.test(pair.look) ? "Crepe sole" : /hiking|combat/i.test(pair.look) ? "Commando sole" : "Leather sole");
  }
  if (!draft.extras.includes("laser")) out.push("Laser initials on the heel");
  if (!out.includes("Grey hide") && draft.hide !== "Grey") out.unshift("Grey hide, aqua stitch");
  out.push(`UK ${draft.size}`);
  return [...new Set(out)].slice(0, 8);
}
