import { useEffect, useState } from "react";
import { SableLockup } from "@/components/sable-lockup";

const CRM = "https://sable-floor.vercel.app/api/lead";

type ProofLead = {
  id: string;
  name?: string;
  paid?: boolean;
  proofUrl?: string;
  proofStatus?: string;
};

function compressProof(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      reject(new Error("Use a jpg, png or webp."));
      return;
    }
    const img = new Image();
    const href = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth || img.width || 1;
      let h = img.naturalHeight || img.height || 1;
      const max = 1280;
      const scale = Math.min(1, max / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
      let q = 0.72;
      let data = canvas.toDataURL("image/jpeg", q);
      while (data.length > 480000 && q > 0.42) {
        q -= 0.08;
        data = canvas.toDataURL("image/jpeg", q);
      }
      URL.revokeObjectURL(href);
      resolve(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(href);
      reject(new Error("Could not read that image."));
    };
    img.src = href;
  });
}

export function ProofDrop({ token }: { token: string }) {
  const [lead, setLead] = useState<ProofLead | null>(null);
  const [status, setStatus] = useState<"load" | "ready" | "missing" | "sent" | "busy" | "fail">("load");
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    const q = encodeURIComponent(token);
    fetch(`${CRM}?proof=${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const hit = Array.isArray(data?.leads) ? data.leads[0] : null;
        if (!hit?.id) {
          setStatus("missing");
          return;
        }
        setLead(hit);
        if (hit.paid) setStatus("sent");
        else if (hit.proofUrl && hit.proofStatus !== "rejected") setStatus("sent");
        else setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("missing");
      });
    return () => {
      alive = false;
    };
  }, [token]);

  async function onFile(file: File | undefined) {
    if (!file || !lead?.id) return;
    setStatus("busy");
    setNote("Sending…");
    try {
      const url = await compressProof(file);
      const now = Date.now();
      const body = {
        id: lead.id,
        proofUrl: url,
        proofAt: now,
        proofBy: "client",
        proofStatus: "in",
        nextAction: "Proof attached — verify EFT",
        nextActionAt: null,
        sitAt: now,
        paid: false,
        updatedAt: now,
      };
      const r = await fetch("/api/lead", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        setStatus("fail");
        setNote("Could not attach. WhatsApp Sable with the screenshot.");
        return;
      }
      setStatus("sent");
      setNote("Proof sent. Sable will confirm. This is not paid yet.");
    } catch (err) {
      setStatus("fail");
      setNote(err instanceof Error ? err.message : "Could not read that image.");
    }
  }

  const who = lead?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <section className="border-b border-ink/10 bg-card px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1080px]">
        <SableLockup />
        <p className="font-sans mt-6 text-[11px] tracking-[0.22em] text-muted uppercase">EFT proof</p>
        <h1 className="font-display mt-2 text-3xl tracking-[-0.03em]">
          {status === "missing" ? "Ask Sable for a ticket link." : `${who}, send the screenshot.`}
        </h1>
        {status === "load" || status === "busy" ? (
          <p className="mt-3 font-body text-[15px] text-muted">{note || "Looking it up."}</p>
        ) : null}
        {status === "missing" ? (
          <p className="mt-3 font-body text-[15px] text-muted">We cannot see that ticket. WhatsApp Sable and we will send a fresh link.</p>
        ) : null}
        {status === "sent" ? (
          <p className="mt-3 font-body text-[15px] text-muted">
            {note || "Proof is on the ticket. Sable marks it paid — sending this does not confirm the pair."}
          </p>
        ) : null}
        {status === "ready" || status === "fail" ? (
          <div className="mt-4">
            <p className="font-body text-[15px] text-muted">
              Screenshot of the EFT. Staff mark it paid. Sending this does not confirm the pair.
            </p>
            <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-ink px-5 font-sans text-[12px] font-medium tracking-[0.14em] text-paper uppercase">
              Choose screenshot
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
            {note ? <p className="mt-3 font-body text-sm text-muted">{note}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
