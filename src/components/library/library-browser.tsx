"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlignLeft, BookOpen, Check, Clock, PenLine, Search, Timer, Trash2, Type, X } from "lucide-react";
import { deleteCustomTextAction } from "@/actions/library";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { categories, categoryLabels, difficultyLabels, type Category, type Difficulty } from "@/lib/content/types";
import { formatReadTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "./bookmark-button";
import { CustomTextDialog } from "./custom-text-dialog";

export type LibraryItem = {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  difficulty: Difficulty;
  words: number;
  saved: boolean;
  reads: number;
  lastRead: string | null;
};

export type CustomItem = { id: string; title: string; words: number; createdAt: string; excerpt: string };

type Tab = "all" | "saved" | "mine";

function DifficultyDots({ level }: { level: Difficulty }) {
  return (
    <span className="flex items-center gap-1" title={difficultyLabels[level]} aria-label={`Difficulty: ${difficultyLabels[level]}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("h-2.5 w-1 rounded-full", i <= level ? "bg-ink-2" : "bg-surface-3")} />
      ))}
      <span className="ml-1 text-[12px] text-ink-3">{difficultyLabels[level]}</span>
    </span>
  );
}

export function LibraryBrowser({ items, custom, comfortWpm }: { items: LibraryItem[]; custom: CustomItem[]; comfortWpm: number }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [diff, setDiff] = useState<Difficulty | 0>(0);
  const [sort, setSort] = useState<"recommended" | "short" | "long" | "unread">("recommended");
  const [addOpen, setAddOpen] = useState(params.get("new") === "1");
  const [confirmDelete, setConfirmDelete] = useState<CustomItem | null>(null);
  const [deleting, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter(
      (i) =>
        (tab !== "saved" || i.saved) &&
        (cat === "all" || i.category === cat) &&
        (!diff || i.difficulty === diff) &&
        (!needle || i.title.toLowerCase().includes(needle) || i.summary.toLowerCase().includes(needle) || categoryLabels[i.category].toLowerCase().includes(needle)),
    );
    if (sort === "short") list = [...list].sort((a, b) => a.words - b.words);
    else if (sort === "long") list = [...list].sort((a, b) => b.words - a.words);
    else if (sort === "unread") list = [...list].sort((a, b) => a.reads - b.reads);
    else list = [...list].sort((a, b) => (a.reads === 0 ? 0 : 1) - (b.reads === 0 ? 0 : 1) || a.difficulty - b.difficulty);
    return list;
  }, [items, tab, cat, diff, q, sort]);

  const customFiltered = custom.filter((c) => !q.trim() || c.title.toLowerCase().includes(q.trim().toLowerCase()));
  const savedCount = items.filter((i) => i.saved).length;
  const hasFilters = q || cat !== "all" || diff;

  const closeAdd = () => {
    setAddOpen(false);
    if (params.get("new")) router.replace(pathname);
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          value={tab}
          onChange={setTab}
          label="Library sections"
          options={[
            { value: "all", label: `Library · ${items.length}` },
            { value: "saved", label: `Saved · ${savedCount}` },
            { value: "mine", label: `My texts · ${custom.length}` },
          ]}
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 pl-10" aria-label="Search the library" />
            {q ? (
              <button type="button" onClick={() => setQ("")} className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-3 hover:text-ink" aria-label="Clear search">
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Button onClick={() => setAddOpen(true)} icon={<PenLine className="size-4" />} className="h-10 shrink-0">
            <span className="hidden sm:inline">Add text</span>
          </Button>
        </div>
      </div>

      {tab !== "mine" ? (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {(["all", ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                    cat === c ? "bg-ink text-bg" : "bg-surface text-ink-2 ring-1 ring-line ring-inset hover:text-ink",
                  )}
                >
                  {c === "all" ? "All topics" : categoryLabels[c]}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Select value={diff} onChange={(e) => setDiff(Number(e.target.value) as Difficulty | 0)} className="h-9 w-40 text-[13px]" aria-label="Difficulty">
                <option value={0}>Any difficulty</option>
                <option value={1}>Accessible</option>
                <option value={2}>Moderate</option>
                <option value={3}>Challenging</option>
              </Select>
              <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 w-44 text-[13px]" aria-label="Sort">
                <option value="recommended">Recommended</option>
                <option value="unread">Least read</option>
                <option value="short">Shortest first</option>
                <option value="long">Longest first</option>
              </Select>
            </div>
          </div>

          {filtered.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((i) => (
                <li key={i.slug}>
                  <Link
                    href={`/library/${i.slug}`}
                    className="card group flex h-full flex-col p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] font-medium text-accent-ink">{categoryLabels[i.category]}</span>
                      <div className="-mt-1.5 -mr-1.5">
                        <BookmarkButton slug={i.slug} saved={i.saved} size="sm" />
                      </div>
                    </div>
                    <h3 className="mt-1 text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">{i.title}</h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-3">{i.summary}</p>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                      <DifficultyDots level={i.difficulty} />
                      <span className="flex items-center gap-3 text-[12px] text-ink-3">
                        {i.reads ? (
                          <span className="flex items-center gap-1 text-good-ink" title={i.lastRead ? `Last read ${formatRelative(i.lastRead)}` : undefined}>
                            <Check className="size-3.5" /> Read{i.reads > 1 ? ` ×${i.reads}` : ""}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatReadTime(i.words, comfortWpm)}
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={tab === "saved" && !hasFilters ? <BookOpen /> : <Search />}
              title={tab === "saved" && !hasFilters ? "Nothing saved yet" : "No matches"}
              description={
                tab === "saved" && !hasFilters
                  ? "Tap the bookmark on any article to keep it here for later."
                  : "Try a different search or clear the filters."
              }
              action={
                hasFilters ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQ("");
                      setCat("all");
                      setDiff(0);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null
              }
            />
          )}
        </>
      ) : customFiltered.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {customFiltered.map((c) => (
            <li key={c.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-semibold text-ink">{c.title}</h3>
                  <p className="text-[12px] text-ink-3">
                    {c.words.toLocaleString("en-US")} words · added {formatRelative(c.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(c)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:bg-bad-soft hover:text-bad-ink"
                  aria-label={`Delete ${c.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-3 line-clamp-2 flex-1 font-serif text-[14px] leading-relaxed text-ink-2">{c.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/train/timed?text=${c.id}&from=library`} className="flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
                  <Timer className="size-3.5" /> Timed
                </Link>
                <Link href={`/train/pacer?text=${c.id}&from=library`} className="flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
                  <AlignLeft className="size-3.5" /> Pacer
                </Link>
                <Link href={`/train/rsvp?text=${c.id}&from=library`} className="flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
                  <Type className="size-3.5" /> RSVP
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<PenLine />}
          title={q ? "No matches" : "Practice with your own reading"}
          description="Paste an article, report or chapter. You can read it with the timer, the pacer or RSVP. Comprehension questions are only available for library texts."
          action={<Button onClick={() => setAddOpen(true)}>Add your first text</Button>}
        />
      )}

      <CustomTextDialog open={addOpen} onClose={closeAdd} />
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this text?" size="sm">
        <p className="text-[14px] text-ink-2">
          &ldquo;{confirmDelete?.title}&rdquo; will be removed. Sessions you&apos;ve already read stay in your history.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={() =>
              startDelete(async () => {
                const res = await deleteCustomTextAction(confirmDelete!.id);
                if (!res.ok) toast({ tone: "error", title: "Couldn't delete", description: res.error });
                else toast({ tone: "success", title: "Text deleted" });
                setConfirmDelete(null);
                router.refresh();
              })
            }
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
