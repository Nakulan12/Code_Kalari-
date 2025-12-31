"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, BarChart3, CheckCircle, XCircle, Loader } from "lucide-react"
import { getSession, logout } from "@/lib/session"
import { checkAccess, logAccess, getStats } from "@/lib/udcf-core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClientApplicationSimulator() {
  const router = useRouter()
  const [session, setLocalSession] = useState(null)
  const [userId, setUserId] = useState("")
  const [purpose, setPurpose] = useState("analytics")
  const [dataCategory, setDataCategory] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0,
  })
  const [requestHistory, setRequestHistory] = useState([])

  useEffect(() => {
    const appSession = getSession()
    if (!appSession || appSession.role !== "app") {
      router.push("/access?role=app")
      return
    }
    setLocalSession(appSession)
    loadStats()
  }, [router])

  const loadStats = () => {
    const currentStats = getStats()
    setStats(currentStats)
  }

  const handleRequest = async () => {
    if (!userId.trim()) return

    setLoading(true)
    setResult(null)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check consent and policy
    const { decision, reason } = checkAccess(userId, session.username, session.username, purpose, dataCategory)

    // Log the access attempt
    const log = logAccess(userId, session.username, session.username, purpose, dataCategory, decision, reason)

    setResult({
      decision,
      reason,
      logId: log.id,
    })

    // Update stats
    loadStats()

    // Add to history
    setRequestHistory((prev) => [
      {
        id: log.id,
        timestamp: new Date().toLocaleTimeString(),
        userId,
        purpose,
        dataCategory,
        decision,
      },
      ...prev.slice(0, 4),
    ])

    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
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
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">{session.username} (Client Application)</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Panel */}
          <div className="lg:col-span-2">
            <Card className="border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Client Application Simulator</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Request user data - firewall will enforce consent in real-time
              </p>

              <div className="space-y-6">
                {/* User ID Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">User Identifier</label>
                  <input
                    type="text"
                    placeholder="Enter user ID to request data for"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                {/* Purpose Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Declared Purpose</label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="personalization">Personalization</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ai_training">AI Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Category Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data Category Requested</label>
                  <Select value={dataCategory} onValueChange={setDataCategory}>
                    <SelectTrigger className="border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile">Profile Data</SelectItem>
                      <SelectItem value="usage">Usage / Learning Data</SelectItem>
                      <SelectItem value="analytics">Analytics / AI Training Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRequest}
                  disabled={!userId.trim() || loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Checking Firewall...
                    </>
                  ) : (
                    "Request User Data"
                  )}
                </Button>
              </div>

              {/* Result Display */}
              {result && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Firewall Decision</h3>
                  <div
                    className={`p-4 rounded-lg border ${
                      result.decision === "ALLOW" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.decision === "ALLOW" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`font-bold text-lg ${
                            result.decision === "ALLOW" ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {result.decision}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">{result.reason}</p>
                        <p className="text-xs text-muted-foreground mt-3 font-mono">Log ID: {result.logId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Stats & History */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Firewall Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests Today</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalRequests}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Allowed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.allowedRequests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blocked</p>
                    <p className="text-2xl font-bold text-red-600">{stats.blockedRequests}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Request History */}
            <Card className="border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Request History</h3>
              {requestHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No requests yet</p>
              ) : (
                <div className="space-y-3">
                  {requestHistory.map((req) => (
                    <div key={req.id} className="text-xs border-l-2 border-border pl-3 py-1">
                      <p className="font-medium text-foreground">{req.timestamp}</p>
                      <p className="text-muted-foreground">{req.purpose}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {req.decision === "ALLOW" ? (
                          <span className="text-green-600">✓ {req.decision}</span>
                        ) : (
                          <span className="text-red-600">✗ {req.decision}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Navigation */}
            <Link href="/dashboard/status">
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Firewall Control Plane
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          UDCF enforces consent at every request | Applications cannot bypass firewall
        </div>
      </footer>
    </div>
  )
}
