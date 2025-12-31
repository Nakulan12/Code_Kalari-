"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [role, setRole] = useState<"user" | "app">((searchParams.get("role") as any) || "user")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    // Store session in localStorage (simplified auth for V0)
    localStorage.setItem(
      "udcf_session",
      JSON.stringify({
        username,
        role,
        loginTime: new Date().toISOString(),
      }),
    )

    // Route based on role
    if (role === "user") {
      router.push("/dashboard/user")
    } else {
      router.push("/dashboard/app")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">UDCF</span>
        </div>

        {/* Login Card */}
        <Card className="border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Sign In</h1>
          <p className="text-center text-sm text-muted-foreground mb-8">Access the consent firewall platform</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">Demo: Try "john_doe", "acme_corp", or any username</p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Role</Label>
              <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex-1 cursor-pointer">
                    <div className="font-medium text-foreground">Data Owner (User)</div>
                    <div className="text-xs text-muted-foreground">Control consent, view access history</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="app" id="app" />
                  <Label htmlFor="app" className="flex-1 cursor-pointer">
                    <div className="font-medium text-foreground">Client Application</div>
                    <div className="text-xs text-muted-foreground">Request data with purpose</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={!username.trim()}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>Demo credentials are optional. Enter any username to proceed.</p>
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
