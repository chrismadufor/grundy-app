interface DriverStatusBadgeProps {
  status: "Pending" | "Paid" | "Delivered";
}

export default function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  const styles: Record<DriverStatusBadgeProps["status"], string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

