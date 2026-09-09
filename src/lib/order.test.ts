import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderMessage, orderPayload, orderTotal, whatsappOrderUrl, type OrderLine } from "./order.ts";

const chelsea: OrderLine = {
  id: "1",
  sku: "45015",
  look: "Chelsea",
  title: "Chelsea 45015",
  price: 1150,
  pairPrice: 1100,
  size: "8",
  hide: "Grey",
  extras: ["stitch"],
  spec: "Stitch Aqua",
};

const vellie: OrderLine = {
  id: "2",
  sku: "45001",
  look: "Vellie",
  title: "Vellie 45001",
  price: 599,
  pairPrice: 599,
  size: "9",
  hide: "As photographed",
  extras: [],
  spec: "",
};

describe("two-pair ticket", () => {
  it("totals both lasts plus send-in-SA", () => {
    assert.equal(orderTotal([chelsea, vellie], "collect"), 1749);
    assert.equal(orderTotal([chelsea, vellie], "local"), 1849);
  });

  it("sends each pair as its own line, not qty 2 of the first", () => {
    const body = orderPayload({
      lines: [chelsea, vellie],
      name: "Thabo Molefe",
      phone: "0821234567",
      delivery: "collect",
    });
    assert.equal(body.pairCount, 2);
    assert.equal(body.qty, 2);
    assert.equal(body.items.length, 2);
    assert.equal(body.items[0].sku, "45015");
    assert.equal(body.items[1].sku, "45001");
    assert.equal(body.items[0].qty, 1);
    assert.equal(body.items[1].qty, 1);
    assert.equal(body.items[1].size, "9");
    assert.equal(body.items[0].extras.custom, false);
    assert.equal(body.items[0].extras.stitch, true);
    assert.equal(body.items[0].extras.stitchColour, "aqua");
    assert.equal(body.items[0].colour, "Grey");
    assert.match(String(body.note), /45015/);
    assert.match(String(body.note), /45001/);
  });

  it("whatsapp text names both pairs and does not navigate itself", () => {
    const url = whatsappOrderUrl([chelsea, vellie], "Thabo Molefe", "0821234567", "collect");
    assert.match(url, /^https:\/\/wa\.me\/27826001950\?text=/);
    const text = decodeURIComponent(url.split("text=")[1] || "");
    assert.match(text, /Chelsea 45015/);
    assert.match(text, /Vellie 45001/);
    assert.match(text, /Thabo Molefe/);
  });

  it("order message lists both lasts", () => {
    const msg = orderMessage([chelsea, vellie], "Thabo Molefe", "0821234567");
    assert.match(msg, /45015/);
    assert.match(msg, /45001/);
    assert.match(msg, /R1749/);
  });
});
