"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomTextAction } from "@/actions/library";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import type { FormState } from "@/lib/validation";

export function CustomTextDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createCustomTextAction, null);
  const [body, setBody] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (state?.success) {
      toast({ tone: "success", title: "Text added", description: "Choose a reading mode to practice with it." });
      setBody("");
      onClose();
      router.refresh();
    }
  }, [state, onClose, router, toast]);

  const fe = state?.fieldErrors ?? {};
  return (
    <Dialog open={open} onClose={onClose} title="Add your own text" description="Paste an article, a chapter or a report. It stays private to your account." size="lg">
      <form action={action} className="space-y-4" noValidate>
        <ErrorBanner>{state?.error}</ErrorBanner>
        <Field label="Title" htmlFor="ct-title" error={fe.title}>
          <Input id="ct-title" name="title" maxLength={120} defaultValue={state?.values?.title} aria-invalid={!!fe.title} required />
        </Field>
        <Field
          label="Text"
          htmlFor="ct-body"
          error={fe.body}
          hint={`${words.toLocaleString("en-US")} words · 50 to 20,000 words`}
        >
          <Textarea
            id="ct-body"
            name="body"
            className="min-h-64 font-serif text-[15px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-invalid={!!fe.body}
            placeholder="Paste your text here. Separate paragraphs with a blank line."
            required
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save text
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
