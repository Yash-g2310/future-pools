import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 h-full p-4">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard/staking" className="hover:text-gray-400">
            Staking
          </Link>
        </li>
        <li>
          <Link href="/dashboard/lending" className="hover:text-gray-400">
            Lending
          </Link>
        </li>
        <li>
          <Link href="/dashboard/borrowing" className="hover:text-gray-400">
            Borrowing
          </Link>
        </li>
      </ul>
    </div>
  );
}