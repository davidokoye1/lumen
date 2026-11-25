"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { frameIndexAt, type Frame, type Token } from "@/lib/reading/text";

/**
 * Drives timed presentation of frames. Position is tracked as a token index,
 * so frames can be rebuilt (speed or chunk changes) without losing your place.
 * Only time spent actually playing counts toward reading time.
 */
export function usePlayback({
  frames,
  tokens,
  easeIn,
  onEnd,
}: {
  frames: Frame[];
  tokens: Token[];
  easeIn: boolean;
  onEnd: () => void;
}) {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const activeMs = useRef(0);
  const maxShown = useRef(0);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const frameIdx = frameIndexAt(frames, pos);
  const frame = frames[frameIdx] ?? null;
  const done = frameIdx >= frames.length;

  useEffect(() => {
    if (!playing) return;
    if (!frame) {
      setPlaying(false);
      onEndRef.current();
      return;
    }
    maxShown.current = Math.max(maxShown.current, frame.end + 1);
    const ease = easeIn ? 1 + 0.45 * Math.max(0, 1 - activeMs.current / 8000) : 1;
    const t0 = performance.now();
    let fired = false;
    const id = setTimeout(() => {
      fired = true;
      activeMs.current += performance.now() - t0;
      setPos(frame.end + 1);
    }, frame.ms * ease);
    return () => {
      clearTimeout(id);
      if (!fired) activeMs.current += performance.now() - t0;
    };
  }, [playing, frame, easeIn]);

  const play = useCallback(() => {
    if (frameIndexAt(frames, pos) >= frames.length) setPos(0);
    setPlaying(true);
  }, [frames, pos]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  const seekToken = useCallback((t: number) => setPos(Math.max(0, Math.min(tokens.length, t))), [tokens.length]);

  const stepFrame = useCallback(
    (dir: 1 | -1) => {
      const i = frameIndexAt(frames, pos);
      const next = frames[Math.max(0, Math.min(frames.length - 1, i + dir))];
      if (next) setPos(next.start);
    },
    [frames, pos],
  );

  const stepSentence = useCallback(
    (dir: 1 | -1) => {
      const cur = tokens[Math.min(pos, tokens.length - 1)];
      if (!cur) return;
      if (dir === -1) {
        // If we're mid-sentence, go to its start; otherwise to the previous sentence.
        const target = pos > cur.sentenceStart ? cur.sentenceStart : tokens[Math.max(0, cur.sentenceStart - 1)]?.sentenceStart ?? 0;
        setPos(target);
      } else {
        let j = pos;
        while (j < tokens.length && !tokens[j].sentenceEnd) j++;
        setPos(Math.min(tokens.length - 1, j + 1));
      }
    },
    [tokens, pos],
  );

  const restart = useCallback(() => {
    setPos(0);
    setPlaying(false);
  }, []);

  const remainingMs = frames.slice(frameIdx).reduce((a, f) => a + f.ms, 0);

  return {
    pos,
    frame,
    frameIdx,
    done,
    playing,
    play,
    pause,
    toggle,
    seekToken,
    stepFrame,
    stepSentence,
    restart,
    remainingMs,
    activeMs,
    /** Tokens shown so far (high-water mark) */
    wordsShown: () => Math.max(maxShown.current, done ? tokens.length : 0),
  };
}
