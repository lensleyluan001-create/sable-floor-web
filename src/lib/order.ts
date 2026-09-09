import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { extraPrice, pairTitle, type Pair } from "./catalog";

export type OrderLine = {
  id: string;
  sku: string;
  look: string;
  title: string;
  price: number;
  pairPrice: number;
  size: string;
  hide: string;
  extras: string[];
  spec: string;
};

export type Delivery = "collect" | "local" | "int";

export const DELIVERY: { id: Delivery; label: string; fee: number }[] = [
  { id: "collect", label: "Collect", fee: 0 },
  { id: "local", label: "Send in SA", fee: 100 },
  { id: "int", label: "Send abroad", fee: 300 },
];

export function deliveryFee(id: Delivery): number {
  return DELIVERY.find((d) => d.id === id)?.fee ?? 0;
}

const KNOWN_EXTRAS = ["laces", "stitch", "elastic", "sole", "lining", "hardware", "laser"] as const;

function colourFromSpec(spec: string, key: string, fallback: string) {
  const m = String(spec || "").match(new RegExp(key + "\\s+([A-Za-z]+)", "i"));
  let v = (m?.[1] || fallback).toLowerCase();
  if (v === "rawhide") v = "natural";
  return v;
}

function extrasObject(line: OrderLine) {
  const extras = line.extras;
  const knownOn = extras.some((x) => KNOWN_EXTRAS.includes(x as (typeof KNOWN_EXTRAS)[number]) || x.startsWith("Laser"));
  return {
    laser: extras.includes("laser") || extras.some((x) => x.startsWith("Laser")),
    laces: extras.includes("laces"),
    laceColour: extras.includes("laces") ? colourFromSpec(line.spec, "Laces", "natural") : "natural",
    stitch: extras.includes("stitch"),
    stitchColour: extras.includes("stitch") ? colourFromSpec(line.spec, "Stitch", "cream") : "cream",
    elastic: extras.includes("elastic"),
    elasticColour: extras.includes("elastic") ? colourFromSpec(line.spec, "Elastic", "cream") : "cream",
    sole: extras.includes("sole"),
    soleKind: extras.includes("sole") ? colourFromSpec(line.spec, "Sole", "leather") : "leather",
    lining: extras.includes("lining"),
    liningKind: extras.includes("lining") ? colourFromSpec(line.spec, "Lining", "leather") : "leather",
    hardware: extras.includes("hardware"),
    hardwareKind: extras.includes("hardware") ? colourFromSpec(line.spec, "Hardware", "brass") : "brass",
    custom: Boolean(line.spec) && !knownOn,
    customNote: line.spec || "",
  };
}

type OrderState = {
  lines: OrderLine[];
  name: string;
  phone: string;
  delivery: Delivery;
  justAdded: string | null;
  add: (pair: Pair, size: string, hide: string, extras: string[], spec?: string) => void;
  remove: (id: string) => void;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setDelivery: (delivery: Delivery) => void;
  clearJustAdded: () => void;
  clear: () => void;
};

export const useOrder = create<OrderState>()(
  persist(
    (set) => ({
      lines: [],
      name: "",
      phone: "",
      delivery: "collect",
      justAdded: null,
      add: (pair, size, hide, extras, spec = "") =>
        set((s) => ({
          justAdded: pairTitle(pair),
          lines: [
            ...s.lines,
            {
              id: `${pair.sku}-${Date.now()}`,
              sku: pair.sku,
              look: pair.look,
              title: pairTitle(pair),
              pairPrice: pair.price,
              price: pair.price + extraPrice(extras),
              size,
              hide,
              extras,
              spec: spec.trim(),
            },
          ],
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setName: (name) => set({ name }),
      setPhone: (phone) => set({ phone }),
      setDelivery: (delivery) => set({ delivery }),
      clearJustAdded: () => set({ justAdded: null }),
      clear: () => set({ lines: [], justAdded: null }),
    }),
    {
      name: "sable-order-v1",
      storage: createJSONStorage(() => {
        if (typeof localStorage === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({
        lines: s.lines,
        name: s.name,
        phone: s.phone,
        delivery: s.delivery,
      }),
    },
  ),
);

export function orderTotal(lines: OrderLine[], delivery: Delivery = "collect"): number {
  return lines.reduce((sum, line) => sum + line.price, 0) + deliveryFee(delivery);
}

export function orderMessage(
  lines: OrderLine[],
  name: string,
  phone: string,
  delivery: Delivery = "collect",
): string {
  const ship = DELIVERY.find((d) => d.id === delivery);
  const body = lines
    .map((line) => {
      const extra = line.extras.length ? `Extras: ${line.extras.join(", ")}` : "Extras: none";
      return [
        `${line.title}  ${line.sku}`,
        `UK size: ${line.size}`,
        `Hide: ${line.hide}`,
        extra,
        line.spec ? `Spec: ${line.spec}` : "",
        `R${line.price}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "SABLE.CO order — Collection 2026",
    "",
    body || "(no pairs yet)",
    "",
    ship ? `${ship.label}: R${ship.fee}` : "",
    `Total listed: R${orderTotal(lines, delivery)}`,
    name ? `Name: ${name}` : "Name:",
    phone ? `WhatsApp: ${phone}` : "WhatsApp:",
    "",
    "Please confirm the pair, then EFT. Most pairs leave 10–14 working days after payment.",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
}

export const DESK_LEAD_URL = "https://sable-floor.vercel.app/api/lead";
export const LEAD_URL = "/api/lead";
export const SABLE_WHATSAPP = "27826001950";

export function whatsappOrderUrl(
  lines: OrderLine[],
  name: string,
  phone: string,
  delivery: Delivery = "collect",
): string {
  return `https://wa.me/${SABLE_WHATSAPP}?text=${encodeURIComponent(orderMessage(lines, name, phone, delivery))}`;
}

export function orderPayload(opts: {
  lines: OrderLine[];
  name: string;
  phone: string;
  delivery: Delivery;
}) {
  const { lines, name, phone, delivery } = opts;
  const fee = deliveryFee(delivery);
  const first = lines[0];
  return {
    name: name.trim(),
    phone: phone.trim(),
    sku: first?.sku || "",
    look: first?.look || "",
    size: first?.size || "",
    qty: lines.length,
    pairCount: lines.length,
    items: lines.map((line) => ({
      sku: line.sku,
      look: line.look,
      title: line.title,
      size: line.size,
      qty: 1,
      colour: line.hide,
      extras: extrasObject(line),
      listed: line.price,
    })),
    delivery,
    deliveryFee: fee,
    colour: first?.hide || "As photographed",
    source: "website",
    status: "new",
    paid: false,
    nextAction: "Send the first WhatsApp",
    note: lines
      .map((l) =>
        [
          l.title,
          l.sku,
          `UK${l.size}`,
          l.hide,
          l.spec,
          l.extras.filter((x) => ["laces", "stitch", "elastic", "sole", "lining", "hardware", "laser"].includes(x)).join(",") ||
            "none",
          `R${l.price}`,
        ]
          .filter(Boolean)
          .join(" "),
      )
      .join(" | "),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

async function postLead(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Could not send");
}

export async function submitOrder(opts: {
  lines: OrderLine[];
  name: string;
  phone: string;
  delivery: Delivery;
}): Promise<void> {
  const body = orderPayload(opts);
  try {
    await postLead(LEAD_URL, body);
  } catch {
    await postLead(DESK_LEAD_URL, body);
  }
}
