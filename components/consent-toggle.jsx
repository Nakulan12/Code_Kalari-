import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ConsentToggle({ label, description, category, enabled, onToggle }) {
  return (
    <Card className="border border-border p-4 flex items-center justify-between hover:bg-secondary/30 transition">
      <div className="flex-1">
        <Label className="text-sm font-semibold text-foreground cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} className="ml-4" />
    </Card>
  )
}
