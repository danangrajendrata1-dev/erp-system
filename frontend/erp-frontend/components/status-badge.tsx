type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const getColor = () => {
    if (
      status === "PAID" ||
      status === "FINISHED" ||
      status === "DELIVERED" ||
      status === "RECEIVED" ||
      status === "READY"    ||
      status === "ACTIVE"   ||
      status === "PRESENT"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      status === "UNPAID" ||
      status === "PENDING" ||
      status === "ORDERED"
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (
      status === "ON PROGRESS" ||
      status === "ON DELIVERY" ||
      status === "QC CHECK" ||
      status === "PRODUCTION"
    ) {
      return "bg-blue-100 text-blue-700";
    }
    if (
        status === "OUT STOCK"  ||
        status === "INACTIVE"   ||
        status === "ABSENT"
    )
    return "bg-slate-100 text-slate-700";
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getColor()}`}
    >
      {status}
    </span>
  );
}