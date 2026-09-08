export const LASER_KINDS = ["Initials", "Name", "Logo"] as const;
export const LASER_PLACES = ["Heel", "Quarter", "Vamp"] as const;

export type LaserKind = (typeof LASER_KINDS)[number];
export type LaserPlace = (typeof LASER_PLACES)[number];

export type LaserMark = {
  kind: LaserKind;
  text: string;
  place: LaserPlace;
};

export function laserExtra(mark: LaserMark): string {
  const place = mark.place.toLowerCase();
  if (mark.kind === "Logo") {
    return `Laser: logo on ${place} (outside, R50 — send the mark on WhatsApp)`;
  }
  const text = mark.text.trim();
  if (!text) return `Laser: ${mark.kind.toLowerCase()} on ${place} (outside, R50)`;
  return `Laser: ${mark.kind.toLowerCase()} "${text}" on ${place} (outside, R50)`;
}

export function laserPreview(mark: LaserMark): string {
  if (mark.kind === "Logo") return "LOGO";
  const text = mark.text.trim();
  if (text) return text.slice(0, 16);
  return mark.kind === "Initials" ? "LL" : "NAME";
}

export const LASER_PLACE_CLASS: Record<LaserPlace, string> = {
  Heel: "bottom-[12%] left-1/2 -translate-x-1/2",
  Quarter: "top-[48%] right-[12%]",
  Vamp: "top-[52%] left-1/2 -translate-x-1/2",
};
