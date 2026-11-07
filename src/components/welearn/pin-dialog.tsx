"use client"

import { useState, type ReactNode } from "react"
import { ShieldCheck, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: (pin: string) => Promise<void> | void
  children?: ReactNode // optional extra form content above the PIN field
}

/** 2-step confirmation: type the 4-digit team PIN (default 1408) to confirm
 *  adding/removing shared content. The server verifies the PIN again. */
export function PinDialog({
  open,
  onOpenChange,
  title,
  description = "This changes shared team content. Enter the team PIN to confirm.",
  confirmLabel = "Confirm",
  onConfirm,
  children,
}: PinDialogProps) {
  const [pin, setPin] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (pin.length !== 4) {
      setError("Enter the 4-digit team PIN")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onConfirm(pin)
      setPin("")
      onOpenChange(false)
    } catch (e) {
      setError((e as Error).message || "Wrong PIN — try again")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setPin(""); setError(null) } onOpenChange(o) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        <div className="flex flex-col items-center gap-2 py-2">
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(null) }} disabled={busy}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={busy || pin.length !== 4}>
            {busy && <Loader2 className="size-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
