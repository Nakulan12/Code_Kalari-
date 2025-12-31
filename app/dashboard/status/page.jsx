"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, CheckCircle, Eye, EyeOff } from "lucide-react"
import { getSession, logout } from "@/lib/session"
import { getLogs, getStats } from "@/lib/udcf-core"

export default function FirewallControlPlane() {
  const router = useRouter()
  const [session, setLocalSession] = useState(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0,
    totalLogs: 0,
  })
  const [allLogs, setAllLogs] = useState([])
  const [blockRate, setBlockRate] = useState(0)
  const [showDetails, setShowDetails] = useState({})

  useEffect(() => {
    const userSession = getSession()
    if (!userSession) {
      router.push("/access")
      return
    }
    setLocalSession(userSession)

    const currentStats = getStats()
    setStats(currentStats)

    const logs = getLogs()
    setAllLogs(logs)

    // Calculate block rate from all logs
    if (logs.length > 0) {
      const blocked = logs.filter((log) => log.decision === "BLOCK").length
      setBlockRate(Math.round((blocked / logs.length) * 100))
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const toggleDetails = (logId) => {
    setShowDetails((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }))
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">UDCF</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Firewall / Admin View</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Firewall Control Plane</h2>
          <p className="text-sm text-muted-foreground">
            System audit view for consent enforcement monitoring and compliance verification
          </p>
        </div>

        {/* SECTION 1: Firewall Status */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Firewall Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">System Status</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Active
              </p>
              <p className="text-xs text-muted-foreground mt-2">Enforcing real-time decisions</p>
            </Card>

            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Enforcement Mode</p>
              <p className="text-2xl font-bold text-foreground">Real-Time</p>
              <p className="text-xs text-muted-foreground mt-2">Decisions applied immediately</p>
            </Card>

            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Policy Engine</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Enabled
              </p>
              <p className="text-xs text-muted-foreground mt-2">All rules active</p>
            </Card>
          </div>
        </div>

        {/* SECTION 2: Enforcement Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Enforcement Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests */}
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Access Requests</p>
              <p className="text-4xl font-bold text-foreground">{stats.totalRequests || allLogs.length}</p>
              <p className="text-xs text-muted-foreground mt-2">Processed</p>
            </Card>

            {/* Allowed Decisions */}
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Allowed Decisions</p>
              <p className="text-4xl font-bold text-green-600">
                {stats.allowedRequests || allLogs.filter((l) => l.decision === "ALLOW").length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {allLogs.length > 0
                  ? Math.round((allLogs.filter((l) => l.decision === "ALLOW").length / allLogs.length) * 100)
                  : 0}
                % pass rate
              </p>
            </Card>

            {/* Blocked Decisions */}
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Blocked Decisions</p>
              <p className="text-4xl font-bold text-red-600">
                {stats.blockedRequests || allLogs.filter((l) => l.decision === "BLOCK").length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{blockRate}% block rate</p>
            </Card>

            {/* Block Rate */}
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Enforcement Ratio</p>
              <p className="text-4xl font-bold text-foreground">{blockRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">Requests blocked</p>
            </Card>
          </div>
        </div>

        {/* SECTION 3: Access Audit Trail */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Access Audit Trail</h3>
          <Card className="border border-border p-6">
            {allLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No access records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Account ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Data Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Declared Purpose</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Decision</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLogs.slice(0, 20).map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-foreground text-xs">{log.userId}</td>
                        <td className="py-3 px-4 capitalize text-muted-foreground text-xs">{log.dataCategory}</td>
                        <td className="py-3 px-4 capitalize text-muted-foreground text-xs">
                          {log.purpose.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                              log.decision === "ALLOW" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.decision}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleDetails(log.id)}
                            className="text-primary hover:underline flex items-center gap-1 text-xs"
                          >
                            {showDetails[log.id] ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Show
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Details Rows */}
                {allLogs.slice(0, 20).map(
                  (log) =>
                    showDetails[log.id] && (
                      <div key={`details-${log.id}`} className="bg-secondary/30 p-4 my-2 rounded border border-border">
                        <p className="text-xs font-semibold text-foreground mb-2">Enforcement Reason</p>
                        <p className="text-xs text-muted-foreground mb-3">{log.reason}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">Application</p>
                            <p className="text-xs text-muted-foreground">{log.appName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">Log ID</p>
                            <p className="text-xs font-mono text-muted-foreground">{log.id}</p>
                          </div>
                        </div>
                      </div>
                    ),
                )}

                {allLogs.length > 20 && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">Showing 20 of {allLogs.length} total records</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* SECTION 4: Enforcement Rules */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Enforcement Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border p-6">
              <h4 className="font-semibold text-foreground mb-2">Consent Verification</h4>
              <p className="text-sm text-muted-foreground">
                Every data access request is validated against the user's current consent settings. No access is granted
                without explicit consent.
              </p>
            </Card>
            <Card className="border border-border p-6">
              <h4 className="font-semibold text-foreground mb-2">No Permanent Access</h4>
              <p className="text-sm text-muted-foreground">
                All access is request-based and stateless. Users can revoke consent at any time, and future requests are
                immediately blocked.
              </p>
            </Card>
            <Card className="border border-border p-6">
              <h4 className="font-semibold text-foreground mb-2">Immediate Revocation</h4>
              <p className="text-sm text-muted-foreground">
                Consent changes take effect in real-time. Revoked categories are blocked on the next access attempt with
                no delay.
              </p>
            </Card>
            <Card className="border border-border p-6">
              <h4 className="font-semibold text-foreground mb-2">Immutable Audit Logs</h4>
              <p className="text-sm text-muted-foreground">
                All decisions are logged automatically with timestamps, reasons, and full context. Logs cannot be edited
                or deleted.
              </p>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 flex-wrap">
          {session.role === "user" && (
            <Link href="/dashboard/user">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                Back to Consent Control Panel
              </Button>
            </Link>
          )}
          {session.role === "app" && (
            <Link href="/dashboard/app">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                Back to Client Application Simulator
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
              Return to Home
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          This view provides read-only visibility into consent enforcement decisions. No personal data is stored or
          processed.
        </div>
      </footer>
    </div>
  )
}
