import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyClerkPatch, emptyDraft, localClerk, parseBrief } from "./custom.ts";

describe("parseBrief — Mervan spec", () => {
  it("reads grey hide and aqua stitch from plain English", () => {
    const brief = parseBrief("gray shoe with aqua color stitching");
    assert.equal(brief.hideLabel, "Grey");
    assert.equal(brief.stitchId, "aqua");
    assert.equal(brief.stitchLabel, "Aqua");
    assert.equal(brief.refuseDesign, undefined);
  });

  it("reads black laces without stealing the hide", () => {
    const brief = parseBrief("grey hide, black laces");
    assert.equal(brief.hideLabel, "Grey");
    assert.equal(brief.laceId, "black");
    assert.equal(brief.laceLabel, "Black");
  });

  it("reads sole, lining, hardware, elastic", () => {
    const brief = parseBrief("crepe sole, wool lining, brass eyelets, aqua elastic");
    assert.equal(brief.soleId, "crepe");
    assert.equal(brief.liningId, "wool");
    assert.equal(brief.hardwareId, "brass");
    assert.equal(brief.elasticId, "aqua");
  });

  it("clears extras when asked", () => {
    const brief = parseBrief("no laser, without laces");
    assert.ok(brief.clear?.includes("laser"));
    assert.ok(brief.clear?.includes("laces"));
  });

  it("refuses a redesign", () => {
    const brief = parseBrief("redesign it as a sneaker");
    assert.equal(brief.refuseDesign, true);
  });
});

describe("localClerk", () => {
  it("keeps the vellie last for an unnamed grey shoe", () => {
    const patch = localClerk("grey hide, aqua stitch");
    assert.equal(patch.hide, "Grey");
    assert.equal(patch.stitch, "aqua");
    assert.match(patch.reply, /shape stays/i);
  });

  it("applies and can drop extras on a draft", () => {
    let draft = emptyDraft("Vellie");
    draft = applyClerkPatch(draft, localClerk("grey hide, aqua stitch, black laces"), "Vellie");
    assert.ok(draft.extras.includes("stitch"));
    assert.ok(draft.extras.includes("laces"));
    draft = applyClerkPatch(draft, localClerk("no laces"), "Vellie");
    assert.equal(draft.extras.includes("laces"), false);
    assert.ok(draft.extras.includes("stitch"));
  });
});
