"use client";

import { useEffect, useRef } from "react";
import type { LiveTranscript } from "@/types/call";

export function TranscriptPanel({ transcripts }: { transcripts: LiveTranscript[] }) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [transcripts]);

  return (
    <section className="panel transcript-panel">
      <div className="panel-heading">
        <p className="eyebrow">Live transcript</p>
        <h2>Conversation</h2>
      </div>

      <div className="transcript-list" ref={listRef}>
        {transcripts.length === 0 ? (
          <p className="empty-state">Transcript will appear here as the patient and Cura speak.</p>
        ) : (
          transcripts.map((transcript) => (
            <article className={`transcript-item transcript-${transcript.role}`} key={transcript.id}>
              <span>{transcript.role === "agent" ? "Cura" : transcript.role === "user" ? "Patient" : "System"}</span>
              <p>{transcript.text}</p>
              {!transcript.is_final ? <small>Listening...</small> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
