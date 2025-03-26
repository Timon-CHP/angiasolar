"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  location: string
  image: string
  rating: number
  comment: string
  installationType: string
  savingsPercentage: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    location: "Hà Nội",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    comment:
      "Tôi đã lắp đặt hệ thống điện mặt trời của AnGia Solar được 6 tháng. Hóa đơn tiền điện giảm đáng kể và dịch vụ hỗ trợ rất tốt. Đội ngũ kỹ thuật làm việc chuyên nghiệp và nhanh chóng.",
    installationType: "Hệ thống 5kW",
    savingsPercentage: 75,
  },
  {
    id: 2,
    name: "Trần Thị B",
    location: "TP. Hồ Chí Minh",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    comment:
      "Tôi rất hài lòng với hệ thống điện mặt trời của AnGia Solar. Tiết kiệm được khoảng 80% tiền điện mỗi tháng. Quá trình lắp đặt diễn ra nhanh chóng và gọn gàng, không ảnh hưởng đến sinh hoạt.",
    installationType: "Hệ thống 8kW",
    savingsPercentage: 80,
  },
  {
    id: 3,
    name: "Lê Văn C",
    location: "Đà Nẵng",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4,
    comment:
      "Sau 1 năm sử dụng, tôi thấy đầu tư vào điện mặt trời là quyết định đúng đắn. Tiền điện giảm đáng kể và hệ thống hoạt động ổn định. Dịch vụ bảo trì của AnGia Solar rất tốt.",
    installationType: "Hệ thống 6kW",
    savingsPercentage: 70,
  },
  {
    id: 4,
    name: "Phạm Thị D",
    location: "Cần Thơ",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    comment:
      "AnGia Solar tư vấn rất tận tình và chuyên nghiệp. Hệ thống điện mặt trời hoạt động hiệu quả ngay cả trong mùa mưa. Tôi đã giới thiệu cho nhiều người quen và họ đều hài lòng.",
    installationType: "Hệ thống 10kW",
    savingsPercentage: 85,
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    location: "Hải Phòng",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    comment:
      "Tôi đã so sánh nhiều đơn vị và chọn AnGia Solar vì giá cả hợp lý và chất lượng tốt. Sau 8 tháng sử dụng, tôi thấy đây là khoản đầu tư sinh lời tốt, tiết kiệm được nhiều chi phí điện.",
    installationType: "Hệ thống 7kW",
    savingsPercentage: 78,
  },
  {
    id: 6,
    name: "Vũ Thị F",
    location: "Nha Trang",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4,
    comment:
      "Hệ thống điện mặt trời của AnGia Solar giúp tôi tiết kiệm đáng kể chi phí điện hàng tháng. Đội ngũ kỹ thuật lắp đặt nhanh chóng và gọn gàng. Rất hài lòng với dịch vụ.",
    installationType: "Hệ thống 5kW",
    savingsPercentage: 72,
  },
]

export default function CustomerExperiences() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollButtons)
      // Initial check
      checkScrollButtons()

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollButtons)
      }
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-amber-800">Trải Nghiệm Của Khách Hàng</h2>
        <p className="text-center text-amber-700 mb-10 max-w-2xl mx-auto">
          Khách hàng nói gì về trải nghiệm lắp đặt và sử dụng điện mặt trời cùng AnGia Solar
        </p>

        {/* Mobile Scroll Controls */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => scroll("left")}
            className={`p-2 rounded-full bg-amber-100 text-amber-700 ${!canScrollLeft ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 rounded-full bg-amber-100 text-amber-700 ${!canScrollRight ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Testimonials Container */}
        <div
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto pb-6 md:pb-0 md:overflow-x-visible snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-[300px] w-[85vw] md:w-auto bg-white rounded-lg shadow-md p-6 flex flex-col snap-start"
            >
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 flex-grow">"{testimonial.comment}"</p>

              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-amber-800 font-medium">{testimonial.installationType}</span>
                  <span className="text-amber-600 font-bold">Tiết kiệm {testimonial.savingsPercentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

