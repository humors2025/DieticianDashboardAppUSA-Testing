export default function SuperAdminClientsPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[#252525] text-[20px] font-bold">Clients</h1>
      <p className="text-[#535359] text-[13px]">
        All clients across the network. Filter by trainer, tier, subscription
        status, signup date.
      </p>
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        Coming in a follow-up PR — paginated table with bulk actions and retroactive
        attribution. Wires up to <code>GET /api/admin/users?role=client</code>.
      </div>
    </div>
  );
}
