"use client";

import { useState } from "react";
import NewCampaignForm from "@/components/NewCampaignForm";

export default function CreateCampaignPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Create a campaign
      </button>
    );
  }

  return (
    <section className="card mx-auto w-full max-w-2xl text-left">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-fg">New campaign</h2>
        <button
          className="text-xs text-faint hover:text-fg"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
      <NewCampaignForm />
    </section>
  );
}
