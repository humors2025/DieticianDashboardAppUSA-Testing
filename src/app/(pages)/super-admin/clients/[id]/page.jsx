"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CLIENTS, TRAINERS, TRAINER_ADMINS, fmtUSDCents } from "@/lib/demo-data";

const TIER_LABEL = { coach: "Coach's Device", lease: "Lease to Own", owned: "Owned" };
const TIER_TERM = { coach: "1 month", lease: "3 months", owned: "12 months" };

export default function ClientDetailPage({ params }) {
  const { id } = use(params);
  const client = CLIENTS.find((c) => c.id === id);

  if (!client) notFound();

  const trainer = TRAINERS.find((t) => t.id === client.parent_user_id);
  const ta = trainer ? TRAINER_ADMINS.find((t) => t.id === trainer.parent_user_id) : null;

  const directCommission = Math.round(client.amount_paid * 0.20);
  const overrideCommission = Math.round(client.amount_paid * 0.20);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/super-admin/clients" className="text-[#308BF9] text-[12px] font-semibold inline-flex items-center gap-1">
        ← Back to Clients
      </Link>

      <div className="bg-white rounded-[12px] border border-[#E1E6ED] p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[#252525] text-[24px] font-bold tracking-[-0.5px]">
              {client.first_name} {client.last_name}
            </h1>
            <span className="rounded-full bg-[#F2A93B] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide">
              Client
            </span>
            <span className={`rounded-full text-[11px] font-semibold px-2.5 py-1 ${
              client.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" :
              client.status === "past_due" ? "bg-[#FFF4E0] text-[#A66B00]" :
              "bg-[#FCEAEB] text-[#B5363A]"
            }`}>
              {client.status}
            </span>
          </div>
          <div className="text-[#535359] text-[13px]">{client.email}</div>
          <div className="text-[#A1A1A1] text-[11px]">Subscribed {client.subscribed_at}</div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button
            disabled
            className="rounded-[10px] bg-[#F5F7FA] text-[#A1A1A1] text-[13px] font-semibold px-4 py-2.5 cursor-not-allowed"
            title="Coming in a follow-up PR — only Super Admin authorizes retroactive recompute"
          >
            Reassign attribution
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
            <div className="text-[#535359] text-[12px]">Tier</div>
            <div className="text-[#252525] text-[20px] font-bold mt-1">{TIER_LABEL[client.tier]}</div>
            <div className="text-[#A1A1A1] text-[11px] mt-1">{TIER_TERM[client.tier]} term</div>
          </div>
          <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
            <div className="text-[#535359] text-[12px]">Amount paid</div>
            <div className="text-[#252525] text-[20px] font-bold mt-1">{fmtUSDCents(client.amount_paid)}</div>
            <div className="text-[#A1A1A1] text-[11px] mt-1">After any promo discount</div>
          </div>
          <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
            <div className="text-[#535359] text-[12px]">Channel cost</div>
            <div className="text-[#252525] text-[20px] font-bold mt-1">{fmtUSDCents(directCommission + overrideCommission)}</div>
            <div className="text-[#A1A1A1] text-[11px] mt-1">40% of revenue (20% + 20%)</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Attribution chain</h3>
        <div className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 bg-white rounded-[10px] p-4 border border-[#E1E6ED]">
            <div className="text-[#A1A1A1] text-[11px] uppercase tracking-wide font-semibold">Trainer (direct, {fmtUSDCents(directCommission)}/period)</div>
            {trainer ? (
              <Link href={`/super-admin/trainers/${trainer.id}`} className="text-[#308BF9] text-[14px] font-semibold hover:underline">
                {trainer.first_name} {trainer.last_name}
              </Link>
            ) : (
              <span className="text-[#A1A1A1] text-[13px]">— unattributed —</span>
            )}
          </div>
          <div className="text-[#A1A1A1] hidden md:block">←</div>
          <div className="flex-1 bg-white rounded-[10px] p-4 border border-[#E1E6ED]">
            <div className="text-[#A1A1A1] text-[11px] uppercase tracking-wide font-semibold">Trainer Admin (override, {fmtUSDCents(overrideCommission)}/period)</div>
            {ta ? (
              <Link href={`/super-admin/trainer-admins/${ta.id}`} className="text-[#308BF9] text-[14px] font-semibold hover:underline">
                {ta.first_name} {ta.last_name}
              </Link>
            ) : (
              <span className="text-[#A1A1A1] text-[13px]">— no override —</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
