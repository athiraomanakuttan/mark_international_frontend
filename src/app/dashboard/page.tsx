import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"

export default function HomePage() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-blue-100">
            Monitor your education platform's performance and manage operations efficiently.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <span className="text-blue-700 font-medium">Import New Leads</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <span className="text-green-700 font-medium">Generate Report</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                <span className="text-purple-700 font-medium">Manage Staff</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Database</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">API Services</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Backup</span>
                <span className="text-blue-600 font-medium">Scheduled</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Updates</h3>
            <div className="space-y-3 text-sm">
              <div className="text-slate-600">
                <span className="font-medium">v2.1.0</span> - Enhanced reporting features
              </div>
              <div className="text-slate-600">
                <span className="font-medium">v2.0.5</span> - Bug fixes and improvements
              </div>
              <div className="text-slate-600">
                <span className="font-medium">v2.0.0</span> - Major UI overhaul
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
