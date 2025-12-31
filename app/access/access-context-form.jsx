"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function AccessContextForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accountId, setAccountId] = useState("")
  const [role, setRole] = useState(searchParams.get("role") || "user")

  const handleProceed = (e) => {
    e.preventDefault()
    if (!accountId.trim()) return

    localStorage.setItem(
      "udcf_session",
      JSON.stringify({
        username: accountId,
        role,
        loginTime: new Date().toISOString(),
      }),
    )

    if (role === "user") {
      router.push("/dashboard/user")
    } else {
      router.push("/dashboard/app")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">UDCF</span>
        </div>

        <Card className="border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Access Context</h1>
          <p className="text-center text-sm text-muted-foreground mb-8">Establish your identity and access role</p>

          <form onSubmit={handleProceed} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-sm font-medium text-foreground">
                Account Identifier
              </Label>
              <Input
                id="accountId"
                type="text"
                placeholder="Enter your account identifier"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                Authentication is abstracted in this prototype. UDCF operates after identity is established.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Access Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value)}>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex-1 cursor-pointer">
                    <div className="font-medium text-foreground">Data Owner</div>
                    <div className="text-xs text-muted-foreground">Control consent and access</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="app" id="app" />
                  <Label htmlFor="app" className="flex-1 cursor-pointer">
                    <div className="font-medium text-foreground">Client Application</div>
                    <div className="text-xs text-muted-foreground">Request data with declared purpose</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={!accountId.trim()}
            >
              Proceed
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
