export default function TailorDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to the Tailor Dashboard</h1>
      {/* Add tailor-specific components here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Active Orders</h2>
          <p className="text-3xl font-bold text-indigo-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Pending Measurements</h2>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Completed This Week</h2>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
      </div>
    </div>
  );
}
