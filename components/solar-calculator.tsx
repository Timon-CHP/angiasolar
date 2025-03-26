"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Label } from "@/components/ui/label"

// List of 63 provinces in Vietnam
const vietnamProvinces = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cần Thơ",
  "Cao Bằng",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "TP Hồ Chí Minh",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
]

export default function SolarCalculator() {
  const [location, setLocation] = useState("")
  const [electricityType, setElectricityType] = useState("sinh-hoat")
  const [monthlyUsage, setMonthlyUsage] = useState("")
  const [usageTime, setUsageTime] = useState(70)
  const [monthlyUsageError, setMonthlyUsageError] = useState("")

  const handleMonthlyUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setMonthlyUsage(value)

    // Validate if the value is greater than 1,000,000 VND
    if (value && Number.parseInt(value) < 1000000) {
      setMonthlyUsageError("Tiền điện phải lớn hơn 1,000,000 VND")
    } else {
      setMonthlyUsageError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    const locationValue = location ? location.toLowerCase().replace(/ /g, "-") : ""
    console.log({ location: locationValue, electricityType, monthlyUsage, usageTime })
  }

  // Common button style class to ensure consistency
  const buttonClass =
    "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg h-12 flex items-center justify-center"

  return (
    <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">Khu vực *</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full" placeholder="Chọn tỉnh/thành phố">
            {location || <span className="text-muted-foreground">Chọn tỉnh/thành phố</span>}
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {vietnamProvinces.map((province) => (
              <SelectItem key={province} value={province} className="py-1 text-xs">
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">Giá điện *</label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="sinh-hoat"
              name="electricity-type"
              value="sinh-hoat"
              checked={electricityType === "sinh-hoat"}
              onChange={() => setElectricityType("sinh-hoat")}
              className="mr-2"
            />
            <Label htmlFor="sinh-hoat" className="text-white cursor-pointer">
              Sinh hoạt
            </Label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="kinh-doanh"
              name="electricity-type"
              value="kinh-doanh"
              checked={electricityType === "kinh-doanh"}
              onChange={() => setElectricityType("kinh-doanh")}
              className="mr-2"
            />
            <Label htmlFor="kinh-doanh" className="text-white cursor-pointer">
              Kinh doanh
            </Label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">
          Tiền điện trung bình hàng tháng (Bao gồm VAT) *
        </label>
        <Input
          type="text"
          value={monthlyUsage}
          onChange={handleMonthlyUsageChange}
          placeholder="Nhập tiền điện trung bình"
          className={`w-full ${monthlyUsageError ? "border-red-500" : ""}`}
        />
        {monthlyUsageError && <p className="text-red-300 text-xs mt-1">{monthlyUsageError}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-white text-sm font-medium mb-2">Mức sử dụng điện từ 6h đến 17h</label>
        <div className="px-2">
          <Slider
            value={[usageTime]}
            onValueChange={(values) => setUsageTime(values[0])}
            max={100}
            step={10}
            className="my-4"
          />
          <div className="flex justify-end">
            <span className="inline-block bg-white text-amber-700 font-medium px-2 py-1 rounded-md">{usageTime}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/phan-tich-hieu-qua" className={buttonClass}>
          Nhận báo giá
        </Link>
      </div>
    </form>
  )
}

