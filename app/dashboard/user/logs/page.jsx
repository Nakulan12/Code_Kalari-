"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, Eye, EyeOff } from "lucide-react"
import { getSession, logout } from "@/lib/session"
import { getLogs } from "@/lib/udcf-core"

export default function AccessAuditTrail() {
  const router = useRouter()
  const [session, setLocalSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [filterDecision, setFilterDecision] = useState("all")
  const [showDetails, setShowDetails] = useState({})

  useEffect(() => {
    const userSession = getSession()
    if (!userSession || userSession.role !== "user") {
      router.push("/access?role=user")
      return
    }
    setLocalSession(userSession)

    const allLogs = getLogs()
    const userLogs = allLogs.filter((log) => log.userId === `user_${userSession.username}`)
    setLogs(userLogs)
    setFilteredLogs(userLogs)
  }, [router])

  const handleFilterChange = (decision) => {
    setFilterDecision(decision)
    if (decision === "all") {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter((log) => log.decision === decision))
    }
  }

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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">{session.username} (Data Owner)</span>
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
        <Card className="border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Audit Trail</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Complete immutable log of all data access attempts - regulator-ready format
          </p>

          {/* Filter Controls */}
          <div className="flex gap-2 mb-8">
            {["all", "ALLOW", "BLOCK"].map((decision) => (
              <Button
                key={decision}
                variant={filterDecision === decision ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(decision)}
                className={filterDecision === decision ? "bg-primary text-primary-foreground" : "border-border"}
              >
                {decision === "all" ? "All Requests" : decision === "ALLOW" ? "✓ Allowed" : "✗ Blocked"}
              </Button>
            ))}
          </div>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No access records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Application</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Data Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Decision</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{log.appName}</td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{log.purpose.replace("_", " ")}</td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{log.dataCategory}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.decision === "ALLOW" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.decision}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleDetails(log.id)}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {showDetails[log.id] ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
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
              {filteredLogs.map(
                (log) =>
                  showDetails[log.id] && (
                    <div key={`details-${log.id}`} className="bg-secondary/30 p-4 my-2 rounded border border-border">
                      <p className="text-xs font-semibold text-foreground mb-2">Decision Reason</p>
                      <p className="text-xs text-muted-foreground">{log.reason}</p>
                      <p className="text-xs font-semibold text-foreground mt-3 mb-1">Log ID</p>
                      <p className="text-xs font-mono text-muted-foreground">{log.id}</p>
                    </div>
                  ),
              )}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href="/dashboard/user">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
              Back to Consent Panel
            </Button>
          </Link>
          <Link href="/dashboard/status">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
              Firewall Control Plane
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          UDCF Audit Trail | All entries are immutable and timestamped
        </div>
      </footer>
    </div>
  )
}
