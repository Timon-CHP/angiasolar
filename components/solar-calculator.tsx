"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

import { provincesSolarData } from "@/lib/calculations"

export default function SolarCalculator() {
  const [location, setLocation] = useState("")
  const [sunHours, setSunHours] = useState(0)
  const [production, setProduction] = useState(0)
  const [electricityType, setElectricityType] = useState("sinh-hoat")
  const [monthlyUsage, setMonthlyUsage] = useState("")
  const [usageTime, setUsageTime] = useState(70)
  const [monthlyUsageError, setMonthlyUsageError] = useState("")

  const handleLocationChange = (selectedLocation: string) => {
    setLocation(selectedLocation)
    const provinceData = provincesSolarData.find(p => p.name === selectedLocation)
    if (provinceData) {
      setSunHours(provinceData.sunHours)
      setProduction(provinceData.production)
    }
  }

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
    
    // Navigate to financial analysis page with all parameters
    window.location.href = `/phan-tich-hieu-qua?location=${encodeURIComponent(location)}&usageTime=${usageTime}&monthlyUsage=${monthlyUsage}&electricityType=${electricityType}`
  }

  // Common button style class to ensure consistency
  const buttonClass =
    "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg h-12 flex items-center justify-center"

  return (
    <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">Khu vực *</label>
        <Select value={location} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full">
            <span className={location ? "text-foreground font-medium" : "text-muted-foreground"}>
              {location || "Chọn tỉnh/thành phố"}
            </span>
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {provincesSolarData.map((province) => (
              <SelectItem key={province.name} value={province.name} className="py-1 text-xs">
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {location && (
          <div className="mt-2 text-xs text-white">
            <p>Số giờ nắng: {sunHours} giờ/ngày</p>
            <p>Sản lượng điện: {production} kWh/kWp/năm</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">Giá điện *</label>
        <div className="flex flex-col space-y-2">
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
              id="kinh-doanh-duoi-6kv"
              name="electricity-type"
              value="kinh-doanh-duoi-6kv"
              checked={electricityType === "kinh-doanh-duoi-6kv"}
              onChange={() => setElectricityType("kinh-doanh-duoi-6kv")}
              className="mr-2"
            />
            <Label htmlFor="kinh-doanh-duoi-6kv" className="text-white cursor-pointer">
              Kinh doanh dưới 6kV
            </Label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="kinh-doanh-6kv-22kv"
              name="electricity-type"
              value="kinh-doanh-6kv-22kv"
              checked={electricityType === "kinh-doanh-6kv-22kv"}
              onChange={() => setElectricityType("kinh-doanh-6kv-22kv")}
              className="mr-2"
            />
            <Label htmlFor="kinh-doanh-6kv-22kv" className="text-white cursor-pointer">
              Kinh doanh từ 6kV đến 22kV
            </Label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="kinh-doanh-tren-22kv"
              name="electricity-type"
              value="kinh-doanh-tren-22kv"
              checked={electricityType === "kinh-doanh-tren-22kv"}
              onChange={() => setElectricityType("kinh-doanh-tren-22kv")}
              className="mr-2"
            />
            <Label htmlFor="kinh-doanh-tren-22kv" className="text-white cursor-pointer">
              Kinh doanh từ 22kV trở lên
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
            min={50}
            max={100}
            step={10}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-white mb-1">
            <span>50%</span>
            <span>100%</span>
          </div>
          <div className="flex justify-end">
            <span className="inline-block bg-white text-amber-700 font-medium px-2 py-1 rounded-md">{usageTime}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button type="submit" className={buttonClass}>
          Nhận báo giá
        </button>
      </div>
    </form>
  )
}

