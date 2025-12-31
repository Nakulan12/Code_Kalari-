import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">UDCF</h1>
        </div>

        <p className="text-xl text-muted-foreground mb-8">Universal Data Consent Firewall</p>

        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          A neutral consent enforcement platform that sits between application backends and databases, enforcing
          real-time user consent for every data access request.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/access?role=user">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-base">
              Access as Data Owner
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/access?role=app">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-border text-foreground font-medium px-8 py-6 text-base hover:bg-secondary bg-transparent"
            >
              Access as Client Application
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto px-4">
        UDCF is a consent enforcement platform. It does not store personal data in audit logs. Logs contain decision
        records only, encrypted for security.
      </footer>
    </div>
  )
}
