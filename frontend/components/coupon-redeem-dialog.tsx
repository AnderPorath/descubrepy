"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCouponImageUrl } from "@/lib/api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessName?: string | null
  couponUrl?: string | null
}

export function CouponRedeemDialog({ open, onOpenChange, businessName, couponUrl }: Props) {
  const src = getCouponImageUrl(couponUrl)

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
