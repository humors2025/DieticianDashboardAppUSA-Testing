export default function SuperAdminTrainersPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[#252525] text-[20px] font-bold">Trainers</h1>
      <p className="text-[#535359] text-[13px]">
        Searchable list of every trainer in the network, with filters by parent
        Trainer Admin, status, and date range.
      </p>
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        Coming in a follow-up PR — server-side search, pagination, drill-down to trainer
        detail. Wires up to <code>GET /api/admin/users?role=trainer</code>.
      </div>
    </div>
  );
}
