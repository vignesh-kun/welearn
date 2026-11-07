"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
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
 *  adding/removing shared content. The server verifies the PIN again.
 *
 *  The dialog only closes after `onConfirm` resolves — if it rejects, the
 *  failure is surfaced inline and the dialog stays open so the PIN can be
 *  retried. Closing is guarded while the request is in flight. */
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
  const fieldRef = useRef<HTMLDivElement>(null)

  // start every open with a clean slate
  useEffect(() => {
    if (!open) {
      setPin("")
      setError(null)
      setBusy(false)
    }
  }, [open])

  async function handleConfirm(e?: React.FormEvent) {
    e?.preventDefault()
    if (busy) return
    if (pin.length !== 4) {
      setError("Enter the 4-digit team PIN")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onConfirm(pin)
      setPin("")
      setError(null)
      onOpenChange(false)
    } catch (err) {
      setError((err as Error)?.message || "Wrong PIN — try again")
      fieldRef.current?.querySelector("input")?.focus()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy && !next) return // never drop the dialog mid-request
        if (!next) {
          setPin("")
          setError(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={!busy}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          fieldRef.current?.querySelector("input")?.focus()
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="grid gap-4">
          {children}

          <div className="flex flex-col items-center gap-3">
            <div ref={fieldRef} className="w-full flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(v) => {
                  setPin(v)
                  setError(null)
                }}
                disabled={busy}
                autoFocus
                aria-label="4-digit team PIN"
                aria-invalid={error ? true : undefined}
                inputMode="numeric"
                autoComplete="one-time-code"
              >
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
            </div>
            {error && (
              <p role="alert" data-tone="error" className="wl-banner w-full justify-center text-center">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || pin.length !== 4}>
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="wl-spinner" aria-hidden />
                  Verifying…
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
