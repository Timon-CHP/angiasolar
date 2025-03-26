"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-600 text-white p-4 flex flex-col sm:flex-row items-center justify-between">
      <p className="text-sm mb-4 sm:mb-0">
        Chúng tôi sử dụng cookie và phân tích để cải thiện trải nghiệm của bạn trên trang web. Bằng cách nhấn "Chấp
        nhận", bạn đồng ý cho phép sử dụng cookie cho mục đích phân tích.
      </p>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="bg-gray-400 text-white border-white hover:bg-amber-700"
          onClick={() => setIsVisible(false)}
        >
          Từ chối
        </Button>
        <Button className="bg-yellow-400 hover:bg-yellow-500 text-amber-800" onClick={() => setIsVisible(false)}>
          Chấp nhận
        </Button>
      </div>
    </div>
  )
}

