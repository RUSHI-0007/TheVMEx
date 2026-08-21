"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { MASK_PRICE_RUPEES } from "@/lib/config";


// ─── Types ────────────────────────────────────────────────────────────────────
interface GuestEntry {
  id: string;
  name: string;
  nameKey: string;
  phone: string;
  source: string;
  sourceKey: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  dupeSourceNames?: string[];
}

interface ParsedSource {
  source: string;
  guests: { name: string; phone: string }[];
}

interface ImportSummary {
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
}

// ─── Source accent colors — muted, considered, not AI-neon ───────────────────
// These are designer-picked hex values: warm neutrals with distinct hues.
// Deterministic via djb2 hash so the same source always gets the same color.
const SOURCE_ACCENTS = [
  "#d4af37", // gold — matches the app's own accent
  "#9ab0c4", // steel blue
  "#c4a98a", // warm sand
  "#a89ac4", // dusty lavender
  "#8ab5a2", // sage
  "#c49a8a", // terracotta
  "#8aac8a", // muted olive
  "#c4b48a", // khaki
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function sourceAccent(source: string): string {
  return SOURCE_ACCENTS[hashString(source.trim().toLowerCase()) % SOURCE_ACCENTS.length];
}

// ─── Back button ──────────────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 font-body text-[0.75rem] tracking-[0.12em] uppercase text-text-muted hover:text-gold transition-colors duration-200 py-1"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Dashboard
    </button>
  );
}

// ─── Upload preview source pill (used only in the upload tab) ────────────────
function SourcePill({ source }: { source: string }) {
  const color = sourceAccent(source);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-[0.65rem] font-body font-semibold tracking-[0.14em] uppercase border rounded-sm bg-transparent"
      style={{ borderColor: `${color}50`, color }}
    >
      {source}
    </span>
  );
}

// ─── XLSX Parser ──────────────────────────────────────────────────────────────
// Row 1: source headers (cells may be merged — value only in anchor cell)
// Row 2: "Name" / "Number" sub-headers
// Row 3+: data
function parseGuestListXlsx(buffer: ArrayBuffer): {
  sources: ParsedSource[];
  allGuests: { name: string; nameKey: string }[];
} {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const merges: XLSX.Range[] = ws["!merges"] ?? [];
  const ref = ws["!ref"];
  if (!ref) return { sources: [], allGuests: [] };

  const range = XLSX.utils.decode_range(ref);

  // Build col → source name, resolving through merge anchors
  const colToSource: Record<number, string> = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const merge = merges.find((m) => m.s.r === 0 && c >= m.s.c && c <= m.e.c);
    const anchorCol = merge ? merge.s.c : c;
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: anchorCol })];
    const name = (cell?.v ?? "").toString().trim();
    if (name) colToSource[c] = name;
  }

  const sourceCols: Record<string, number[]> = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const src = colToSource[c];
    if (src) (sourceCols[src] ??= []).push(c);
  }

  const sources: ParsedSource[] = [];
  const allGuests: { name: string; nameKey: string }[] = [];

  for (const [source, cols] of Object.entries(sourceCols)) {
    const [nameCol, numCol] = cols;
    const guests: { name: string; phone: string }[] = [];
    for (let r = 2; r <= range.e.r; r++) {
      const name  = (ws[XLSX.utils.encode_cell({ r, c: nameCol })]?.v ?? "").toString().trim();
      const phone = numCol !== undefined
        ? (ws[XLSX.utils.encode_cell({ r, c: numCol })]?.v ?? "").toString().trim()
        : "";
      if (!name) continue;
      guests.push({ name, phone });
      allGuests.push({ name, nameKey: name.toLowerCase() });
    }
    if (guests.length > 0) sources.push({ source, guests });
  }

  return { sources, allGuests };
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────
function UploadTab() {
  const [dragging, setDragging]         = useState(false);
  const [parsedSources, setParsedSources] = useState<ParsedSource[] | null>(null);
  const [fileName, setFileName]         = useState("");
  const [importing, setImporting]       = useState(false);
  const [summary, setSummary]           = useState<ImportSummary | null>(null);
  const [error, setError]               = useState("");
  const [crossDupes, setCrossDupes]     = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(""); setSummary(null); setParsedSources(null); setCrossDupes(new Set());
    if (!file.name.match(/\.(xlsx|xls)$/i)) { setError("Please upload an .xlsx or .xls file."); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { sources, allGuests } = parseGuestListXlsx(e.target?.result as ArrayBuffer);
        if (sources.length === 0) { setError("No guest data found. Check row 1 has source names and row 3+ has data."); return; }
        setParsedSources(sources);
        const nameToSources = new Map<string, Set<string>>();
        for (const s of sources) for (const g of s.guests) {
          const k = g.name.trim().toLowerCase();
          const set = nameToSources.get(k) ?? new Set();
          set.add(s.source);
          nameToSources.set(k, set);
        }
        const dupes = new Set<string>();
        nameToSources.forEach((set, k) => { if (set.size > 1) dupes.add(k); });
        setCrossDupes(dupes);
      } catch { setError("Failed to parse the file. Check the format."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0]; if (file) processFile(file);
  };

  const handleConfirmImport = async () => {
    if (!parsedSources) return;
    setImporting(true); setError("");
    try {
      const guests = parsedSources.flatMap((s) => s.guests.map((g) => ({ name: g.name, phone: g.phone, source: s.source })));
      const res  = await fetch("/api/admin/guestlist/import", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setSummary(data); setParsedSources(null); setFileName(""); setCrossDupes(new Set());
    } catch (e) { setError(e instanceof Error ? e.message : "Import failed"); }
    finally { setImporting(false); }
  };

  const totalGuests = parsedSources?.reduce((a, s) => a + s.guests.length, 0) ?? 0;

  return (
    <div className="p-5 space-y-5">
      {summary && (
        <div className="border border-white/10 bg-white/[0.03] px-4 py-4 flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
            <circle cx="9" cy="9" r="8" stroke="#8ab5a2" strokeWidth="1.5" />
            <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#8ab5a2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="font-body text-[0.82rem] font-semibold text-[#ede6da] mb-1">Import complete</p>
            <p className="font-body text-[0.75rem] text-[#5e5a55]">
              <span className="text-[#8ab5a2]">{summary.newCount} new</span>
              {" · "}
              <span className="text-[#d4af37]">{summary.updatedCount} updated</span>
              {" · "}
              {summary.unchangedCount} unchanged
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-white/10 bg-[#c49a8a]/10 px-4 py-3">
          <p className="font-body text-[0.8rem] text-[#c49a8a]">{error}</p>
        </div>
      )}

      {!parsedSources && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 px-6 py-14 border border-dashed cursor-pointer transition-all duration-200 ${
              dragging ? "border-gold/50 bg-gold/[0.04]" : "border-white/10 hover:border-white/20"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3v12M6 9l5-6 5 6" stroke="#5e5a55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h16" stroke="#5e5a55" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-body text-[0.88rem] text-[#9a948c]">Drop your .xlsx file here</p>
              <p className="font-body text-[0.72rem] text-[#5e5a55] mt-1">or click to browse</p>
            </div>
          </div>

          <div className="border border-white/[0.06] p-4 space-y-3">
            <p className="font-body text-[0.62rem] tracking-[0.16em] uppercase text-[#5e5a55]">Expected format</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.73rem] font-body">
                <thead>
                  <tr>
                    <th colSpan={2} className="px-3 py-2 text-center border border-white/[0.06]" style={{ color: sourceAccent("Manthan") }}>Manthan</th>
                    <th colSpan={2} className="px-3 py-2 text-center border border-white/[0.06]" style={{ color: sourceAccent("Gourish") }}>Gourish</th>
                    <th className="px-3 py-2 text-center text-[#5e5a55] border border-white/[0.06]">…</th>
                  </tr>
                  <tr className="text-[#5e5a55]">
                    {["Name","Number","Name","Number","…"].map((h, i) => (
                      <th key={i} className="px-3 py-1.5 font-normal border border-white/[0.04]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[#9a948c]">
                  <tr>
                    {["Rushi K.","9876543210","Aarav M.","9123456789","…"].map((v, i) => (
                      <td key={i} className={`px-3 py-1.5 border border-white/[0.04] ${i % 2 === 1 || i === 4 ? "font-mono" : ""}`}>{v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-body text-[0.65rem] text-[#5e5a55]">
              Source names in row 1 (merged across 2 columns). Row 2 = sub-headers. Data from row 3. Works with Google Sheets exports.
            </p>
          </div>
        </>
      )}

      {parsedSources && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#5e5a55] truncate max-w-[220px]">{fileName}</p>
              <p className="font-display text-[1.2rem] font-bold text-[#ede6da] mt-0.5">
                {totalGuests} guests · {parsedSources.length} source{parsedSources.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button type="button" onClick={() => { setParsedSources(null); setFileName(""); setCrossDupes(new Set()); }}
              className="font-body text-[0.68rem] tracking-[0.1em] uppercase text-[#5e5a55] hover:text-[#c49a8a] transition-colors shrink-0 mt-1">
              Clear
            </button>
          </div>

          {crossDupes.size > 0 && (
            <div className="border border-white/10 bg-[#c4a98a]/[0.07] px-4 py-3 flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <path d="M8 1.5L15 13.5H1L8 1.5z" stroke="#c4a98a" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M8 6v3.5" stroke="#c4a98a" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <p className="font-body text-[0.75rem] text-[#c4a98a]">
                <span className="font-semibold">{crossDupes.size} name{crossDupes.size > 1 ? "s appear" : " appears"} under multiple sources</span>{" "}
                — each is imported as a separate row.
              </p>
            </div>
          )}

          <div className="border border-white/[0.08] divide-y divide-white/[0.05]">
            {parsedSources.map((s) => (
              <div key={s.source} className="px-4 py-3.5 flex items-center justify-between">
                <span className="font-body text-[0.72rem] font-semibold tracking-[0.14em] uppercase" style={{ color: sourceAccent(s.source) }}>
                  {s.source}
                </span>
                <span className="font-display text-[1.1rem] font-bold text-[#ede6da] tabular-nums">{s.guests.length}</span>
              </div>
            ))}
            <div className="px-4 py-3.5 flex items-center justify-between bg-white/[0.02]">
              <span className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-[#5e5a55]">Total</span>
              <span className="font-display text-[1.15rem] font-bold text-[#d4af37] tabular-nums">{totalGuests}</span>
            </div>
          </div>

          <div className="space-y-2">
            {parsedSources.map((s) => (
              <div key={s.source} className="border border-white/[0.06] p-4">
                <p className="font-body text-[0.62rem] tracking-[0.15em] uppercase text-[#5e5a55] mb-2">
                  {s.source} — first {Math.min(5, s.guests.length)}
                </p>
                <ul className="space-y-1.5">
                  {s.guests.slice(0, 5).map((g, i) => {
                    const isDupe = crossDupes.has(g.name.trim().toLowerCase());
                    return (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isDupe && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
                              <path d="M5.5 1L10 9.5H1L5.5 1z" stroke="#c4a98a" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                          )}
                          <span className={`font-body text-[0.85rem] truncate ${isDupe ? "text-[#c4a98a]" : "text-[#9a948c]"}`}>{g.name}</span>
                        </div>
                        {g.phone && <span className="font-mono text-[0.7rem] text-[#5e5a55] shrink-0">{g.phone}</span>}
                      </li>
                    );
                  })}
                  {s.guests.length > 5 && (
                    <li className="font-body text-[0.68rem] text-[#5e5a55] mt-1">+{s.guests.length - 5} more…</li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={importing}
            className="w-full py-4 border border-gold/40 text-[#d4af37] font-body font-semibold text-[0.82rem] tracking-[0.15em] uppercase hover:bg-gold/[0.06] transition-colors disabled:opacity-40"
          >
            {importing ? "Importing…" : `Confirm Import — ${totalGuests} guests`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────
function SearchTab() {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<GuestEntry[]>([]);
  const [loading, setLoading]       = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // ─── Per-guest mask state (keyed by guestId) ───────────────────────────
  const [maskCounts,   setMaskCounts]   = useState<Map<string, number>>(new Map());
  const [maskSending,  setMaskSending]  = useState<Map<string, boolean>>(new Map());
  const [maskSent,     setMaskSent]     = useState<Map<string, boolean>>(new Map());

  const getMaskCount  = (id: string) => maskCounts.get(id)  ?? 1;
  const isMaskSending = (id: string) => maskSending.get(id) ?? false;
  const isMaskSent    = (id: string) => maskSent.get(id)    ?? false;


  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); setExpandedId(null); return; }
    setLoading(true);
    setExpandedId(null);
    try {
      const res  = await fetch(`/api/admin/guestlist/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) setResults(data.results ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 200);
  };

  const updateResult = (updated: GuestEntry) =>
    setResults((prev) => prev.map((r) => r.id === updated.id ? { ...updated, dupeSourceNames: r.dupeSourceNames } : r));

  const handleCheckIn = async (guest: GuestEntry) => {
    setCheckingIn(guest.id);
    try {
      const res  = await fetch("/api/admin/guestlist/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await res.json();
      if (res.ok) updateResult(data.guest);
    } catch { /* silent */ }
    finally { setCheckingIn(null); }
  };

  const handleUndo = async (guest: GuestEntry) => {
    setCheckingIn(guest.id);
    try {
      const res  = await fetch("/api/admin/guestlist/checkin", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: guest.id }),
      });
      const data = await res.json();
      if (res.ok) updateResult(data.guest);
    } catch { /* silent */ }
    finally { setCheckingIn(null); }
  };

  // ─── Send mask order from VIP guest ───────────────────────────────────
  const handleSendMask = async (guest: GuestEntry) => {
    const id    = guest.id;
    const count = getMaskCount(id);
    if (count < 1 || isMaskSending(id) || isMaskSent(id)) return;

    setMaskSending((prev) => new Map(prev).set(id, true));
    try {
      await fetch("/api/admin/masks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guest.name, source: guest.source, maskCount: count }),
      });
      setMaskSent((prev) => new Map(prev).set(id, true));
      setTimeout(() => {
        setMaskSent((prev) => { const m = new Map(prev); m.delete(id); return m; });
      }, 2000);
    } catch { /* silently ignore */ }
    finally {
      setMaskSending((prev) => { const m = new Map(prev); m.delete(id); return m; });
    }
  };


  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "earlier";

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-4 bg-[#0b0b0d] border-b border-white/[0.06] sticky top-0 z-10">
        <div className="relative">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5e5a55] pointer-events-none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id="guest-search-input"
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name…"
            autoComplete="off"
            autoCorrect="off"
            className="w-full pl-11 pr-10 py-4 bg-[#111013] border border-white/[0.08] text-[#ede6da] font-body text-[1rem] outline-none focus:border-white/20 transition-colors placeholder:text-[#5e5a55]"
          />
          {query && (
            <button type="button"
              onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5e5a55] hover:text-[#9a948c] transition-colors">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3.5 3.5l8 8M11.5 3.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto">
        {!query && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="font-body text-[0.75rem] tracking-[0.14em] uppercase text-[#5e5a55]">Type a name to search</p>
          </div>
        )}

        {query && loading && (
          <div className="flex items-center justify-center h-24">
            <p className="font-body text-[0.72rem] tracking-[0.14em] uppercase text-[#5e5a55] animate-pulse">Searching…</p>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
            <p className="font-body text-[0.8rem] text-[#5e5a55]">No match for &ldquo;{query}&rdquo;</p>
            <p className="font-body text-[0.68rem] text-[#5e5a55]/60 mt-1">Check spelling or upload the guest list first</p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            {results.map((guest, idx) => {
              const isBusy   = checkingIn === guest.id;
              const hasDupes = (guest.dupeSourceNames?.length ?? 0) > 0;
              const accent   = sourceAccent(guest.source);
              const isChecked = guest.checkedIn;

              return (
                <div
                  key={guest.id}
                  className={`border-b border-white/[0.05] transition-colors ${isChecked ? "opacity-60" : ""} ${
                    expandedId === guest.id ? "bg-[#111013]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Collapsed Header (Name + Source) */}
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === guest.id ? null : guest.id))}
                    className="w-full text-left px-5 py-5 flex items-start justify-between gap-4 outline-none"
                  >
                    <div>
                      <p className="font-display text-[1.6rem] font-bold text-[#ede6da] leading-tight">
                        {guest.name}
                      </p>
                      <p
                        className="font-body text-[0.95rem] font-extrabold tracking-[0.22em] uppercase mt-1.5"
                        style={{ color: accent, filter: "brightness(1.3)" }}
                      >
                        {guest.source}
                      </p>
                    </div>
                    {/* Expand/Collapse Chevron */}
                    <div className="shrink-0 text-[#5e5a55] mt-1.5">
                      {expandedId === guest.id ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M4 11l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Expanded Details Container */}
                  {expandedId === guest.id && (
                    <div className="px-5 pb-5">
                      <div className="p-4 border border-white/[0.06] bg-[#0b0b0d] space-y-3">

                        {/* Phone */}
                        {guest.phone && (
                          <div>
                            <p className="font-body text-[0.65rem] tracking-[0.16em] uppercase text-[#5e5a55] mb-1">Phone</p>
                            <p className="font-mono text-[0.85rem] text-[#ede6da]">{guest.phone}</p>
                          </div>
                        )}

                        {/* Cross-source dupe warning */}
                        {hasDupes && (
                          <div className="mt-2 border border-[#c4a98a]/20 bg-[#c4a98a]/5 p-3">
                            <p className="font-body text-[0.72rem] text-[#c4a98a]/90">
                              <span className="font-bold">⚠ Warning:</span> also listed on{" "}
                              {guest.dupeSourceNames!.map((s, i) => (
                                <span key={s}><span className="font-semibold text-[#c4a98a]">{s}</span>{i < guest.dupeSourceNames!.length - 1 ? ", " : ""}</span>
                              ))}
                              {" "}list.
                            </p>
                          </div>
                        )}

                        {/* ── Mask counter ── */}
                        <div className="pt-4 mt-4 border-t border-white/[0.05]">
                          <p className="font-body text-[0.6rem] tracking-[0.18em] uppercase text-[#5e5a55] mb-3">
                            Masks for this group?
                          </p>
                          <div className="flex items-center gap-3 mb-3">
                            <button
                              type="button"
                              id={`mask-dec-${guest.id}`}
                              onClick={() => setMaskCounts((prev) => new Map(prev).set(guest.id, Math.max(0, getMaskCount(guest.id) - 1)))}
                              className="w-10 h-10 border border-white/20 text-[#ede6da] text-xl font-bold flex items-center justify-center hover:bg-white/[0.05] active:scale-95 transition-all"
                            >
                              −
                            </button>
                            <div className="flex-1 text-center">
                              <p className="font-display text-[2rem] font-bold text-[#ede6da] tabular-nums leading-none">{getMaskCount(guest.id)}</p>
                              {getMaskCount(guest.id) > 0 && (
                                <p className="font-body text-[0.72rem] text-gold tabular-nums mt-0.5">
                                  ₹{getMaskCount(guest.id) * MASK_PRICE_RUPEES}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              id={`mask-inc-${guest.id}`}
                              onClick={() => setMaskCounts((prev) => new Map(prev).set(guest.id, Math.min(10, getMaskCount(guest.id) + 1)))}
                              className="w-10 h-10 border border-white/20 text-[#ede6da] text-xl font-bold flex items-center justify-center hover:bg-white/[0.05] active:scale-95 transition-all"
                            >
                              +
                            </button>
                          </div>

                          {/* Standalone Send button (only if ALREADY checked in and they want to send more masks) */}
                          {isChecked && getMaskCount(guest.id) > 0 && (
                            <button
                              type="button"
                              id={`mask-send-${guest.id}`}
                              onClick={() => handleSendMask(guest)}
                              disabled={isMaskSending(guest.id) || isMaskSent(guest.id)}
                              className={`w-full py-3 mb-4 font-body font-bold text-[0.78rem] tracking-[0.12em] uppercase transition-all ${
                                isMaskSent(guest.id)
                                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                  : "border border-gold/40 text-gold hover:bg-gold/[0.06] disabled:opacity-40"
                              }`}
                            >
                              {isMaskSent(guest.id) ? "✓ Sent!" : isMaskSending(guest.id) ? "Sending…" : "Send to Mask Counter"}
                            </button>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 mt-3 border-t border-white/[0.06]">
                          {isChecked ? (
                            <div className="flex items-center justify-between">
                              <p className="font-body text-[0.72rem] text-[#9a948c]">
                                Checked in at <span className="font-semibold text-[#ede6da]">{fmt(guest.checkedInAt)}</span>
                              </p>
                              <button
                                type="button"
                                onClick={() => handleUndo(guest)}
                                disabled={isBusy}
                                className="font-body text-[0.65rem] tracking-[0.1em] uppercase text-[#5e5a55] hover:text-[#c49a8a] transition-colors border border-white/[0.06] hover:border-[#c49a8a]/30 px-3 py-1.5 disabled:opacity-30"
                              >
                                {isBusy ? "…" : "Undo"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleCheckIn(guest);
                                if (getMaskCount(guest.id) > 0) {
                                  handleSendMask(guest);
                                }
                              }}
                              disabled={isBusy}
                              className={`w-full py-3 border font-body font-bold text-[0.8rem] tracking-[0.15em] uppercase hover:bg-white/[0.05] transition-colors disabled:opacity-30 ${
                                getMaskCount(guest.id) > 0
                                  ? "border-gold/40 text-gold hover:bg-gold/[0.06]"
                                  : "border-white/20 text-[#ede6da]"
                              }`}
                            >
                              {isBusy 
                                ? "Processing…" 
                                : getMaskCount(guest.id) > 0 
                                  ? `Enter & Send ${getMaskCount(guest.id)} Mask${getMaskCount(guest.id) !== 1 ? 's' : ''}` 
                                  : "Enter"}
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function GuestListPage() {
  const router = useRouter();
  const [tab, setTab]                 = useState<"search" | "upload">("search");
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed]           = useState(false);

  useEffect(() => {
    fetch("/api/admin/health")
      .then((res) => { if (res.ok) setAuthed(true); else router.replace("/admin"); })
      .catch(() => router.replace("/admin"))
      .finally(() => setAuthChecked(true));
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <p className="font-body text-[0.72rem] tracking-[0.2em] uppercase text-[#5e5a55] animate-pulse">Verifying…</p>
      </div>
    );
  }
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-white/[0.06] bg-[#0b0b0d] sticky top-0 z-20">
        <BackButton onClick={() => router.push("/admin")} />
        <div className="flex items-center justify-between mt-3">
          <div>
            <h1 className="font-display text-[1.3rem] font-bold text-[#ede6da]">VIP Guest List</h1>
            <p className="font-body text-[0.62rem] tracking-[0.15em] uppercase text-[#5e5a55] mt-0.5">
              Offline / non-ticket entry
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {(["search", "upload"] as const).map((t) => (
          <button
            key={t}
            type="button"
            id={`guest-tab-${t}`}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 font-body text-[0.7rem] tracking-[0.14em] uppercase transition-colors flex items-center justify-center gap-2 ${
              tab === t
                ? "text-[#ede6da] border-b border-[#d4af37]"
                : "text-[#5e5a55] hover:text-[#9a948c]"
            }`}
          >
            {t === "search" ? (
              <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>Search</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v8M3.5 5l3-3.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>Upload List</>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === "search" ? <SearchTab /> : <UploadTab />}
      </div>
    </div>
  );
}
