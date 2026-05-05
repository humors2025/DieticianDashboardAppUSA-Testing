export default function SuperAdminPayoutsPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[#252525] text-[20px] font-bold">Payouts</h1>
      <p className="text-[#535359] text-[13px]">
        Pipeline of pending and paid commissions across the network.
        Approval UI sits here when manual approval is enabled.
      </p>
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        Coming in a follow-up PR — reads from <code>commissions</code> and{" "}
        <code>payouts</code> tables once Stripe Connect transfers are wired.
      </div>
    </div>
  );
}
