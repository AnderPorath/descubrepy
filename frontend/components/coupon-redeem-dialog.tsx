"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCouponImageUrl } from "@/lib/api"
import { trackBusinessEvent } from "@/lib/track-event"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessName?: string | null
  couponUrl?: string | null
  businessId?: number | null
  businessSlug?: string | null
}

export function CouponRedeemDialog({
  open,
  onOpenChange,
  businessName,
  couponUrl,
  businessId,
  businessSlug,
}: Props) {
  const src = getCouponImageUrl(couponUrl)
  const claimedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      claimedRef.current = false
      return
    }
    if (claimedRef.current) return
    claimedRef.current = true
    trackBusinessEvent({
      businessId,
      slug: businessSlug,
      eventType: "coupon_claim",
    })
  }, [open, businessId, businessSlug])

  const markUsed = () => {
    trackBusinessEvent({
      businessId,
      slug: businessSlug,
      eventType: "coupon_used",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cupón de descuento</DialogTitle>
          <DialogDescription>
            {businessName
              ? `Mostrá este cupón en ${businessName}.`
              : "Presentando ese cupón obtendrá el descuento."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white">
            <Image
              src={src}
              alt="Cupón de descuento"
              width={1024}
              height={1024}
              className="h-auto w-full object-contain"
              unoptimized
              priority
            />
          </div>
          <p className="mt-3 text-sm text-emerald-800">
            Presentando ese cupón obtendrá el descuento.
          </p>
          <Button
            type="button"
            className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={markUsed}
          >
            Ya presenté el cupón
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
