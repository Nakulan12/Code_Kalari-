"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, Activity } from "lucide-react"
import { getSession, logout } from "@/lib/session"
import { setConsent, getConsent } from "@/lib/udcf-core"
import ConsentToggle from "@/components/consent-toggle"

export default function ConsentControlPanel() {
  const router = useRouter()
  const [session, setLocalSession] = useState(null)
  const [consent, setLocalConsent] = useState({
    profile: false,
    usage: false,
    analytics: false,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const userSession = getSession()
    if (!userSession || userSession.role !== "user") {
      router.push("/access?role=user")
      return
    }
    setLocalSession(userSession)

    // Load user's consent settings
    const userConsent = getConsent(userSession.username)
    setLocalConsent(userConsent)

    // Load activity summary
    const saved = localStorage.getItem("udcf_state")
    if (saved) {
      const state = JSON.parse(saved)
      const userLogs = state.logs
        .filter((log) => log.userId === `user_${userSession.username}`)
        .reverse()
        .slice(0, 5)
      setRecentActivity(userLogs)
    }
  }, [router])

  const handleToggle = (category) => {
    const updated = { ...consent, [category]: !consent[category] }
    setLocalConsent(updated)
    setIsSaved(false)
  }

  const handleSave = () => {
    if (!session) return
    setConsent(session.username, consent)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consent Control Panel */}
          <div className="lg:col-span-2">
            <Card className="border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Consent Control Panel</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Manage your data access permissions across all categories
              </p>

              <div className="space-y-4 mb-8">
                <ConsentToggle
                  label="Profile Data"
                  description="Name, email, profile information"
                  category="profile"
                  enabled={consent.profile}
                  onToggle={() => handleToggle("profile")}
                />
                <ConsentToggle
                  label="Usage / Learning Data"
                  description="Application interaction patterns and learning data"
                  category="usage"
                  enabled={consent.usage}
                  onToggle={() => handleToggle("usage")}
                />
                <ConsentToggle
                  label="Analytics / AI Training Data"
                  description="Behavioral analytics and AI model training"
                  category="analytics"
                  enabled={consent.analytics}
                  onToggle={() => handleToggle("analytics")}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Save Consent Settings
                </Button>
                {isSaved && <p className="flex items-center text-sm text-green-600">✓ Settings saved</p>}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent access attempts</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="text-xs border-l-2 border-border pl-3 py-1">
                      <p className="font-medium text-foreground">{activity.appName}</p>
                      <p className="text-muted-foreground">{activity.purpose}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.decision === "ALLOW" ? (
                          <span className="text-green-600">✓ Allowed</span>
                        ) : (
                          <span className="text-red-600">✗ Blocked</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="mt-4 space-y-2">
              <Link href="/dashboard/user/logs" className="block">
                <Button
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-secondary bg-transparent"
                >
                  View Access Audit Trail
                </Button>
              </Link>
              <Link href="/dashboard/status" className="block">
                <Button
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-secondary bg-transparent"
                >
                  Firewall Control Plane
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          UDCF Consent Enforcement Platform | Your consent is enforced at every data access
        </div>
      </footer>
    </div>
  )
}
