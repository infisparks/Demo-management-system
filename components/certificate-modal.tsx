"use client"

import { X } from "lucide-react"
import Image from "next/image"

export default function CertificateModal({
  imageUrl,
  onClose,
}: {
  imageUrl: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Certificate</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative w-full h-96">
          <Image src={imageUrl || "/placeholder.svg"} alt="Certificate" fill className="object-contain" />
        </div>
      </div>
    </div>
  )
}
