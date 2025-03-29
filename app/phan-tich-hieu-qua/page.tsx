"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Home } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

// Add the utility functions for electricity calculations
function tinhTienDienSinhHoat(x: number, bacDien: { tu: number; den: number; gia: number }[]): number {
  let tongTien = 0
  for (let i = 0; i < bacDien.length; i++) {
    const suDung = Math.max(0, Math.min(x - bacDien[i].tu, bacDien[i].den - bacDien[i].tu))
    if (suDung > 0) {
      tongTien += suDung * bacDien[i].gia
    }
  }
  return tongTien
}

function tinhTienDienKinhDoanh(x: number, giaKinhDoanh: number): number {
  return x * giaKinhDoanh
}

// Add IRR calculation function
function calculateIRR(cashFlows: number[]): number {
  let min = 0.0;
  let max = 1.0;
  let guest;
  let NPV;
  
  do {
    guest = (min + max) / 2;
    NPV = 0;
    for (var j = 0; j < cashFlows.length; j++) {
      NPV += cashFlows[j] / Math.pow((1 + guest), j);
    }
    if (NPV > 0) {
      min = guest;
    } else {
      max = guest;
    }
  } while (Math.abs(NPV) > 0.000001);
  
  return guest * 100;
}

function tinhSanLuongDien(capacity: number, sunHours: number, efficiency: number, years: number = 0): number {
  // Calculate base production using standard yield of 1380 kWh/kWp/year
  const annualProduction = 1380 * capacity * (efficiency/100)
  // Convert to monthly production
  const baseProduction = annualProduction / 12
  
  // Apply panel degradation if years parameter is provided
  if (years > 0) {
    // Panel degradation is 0.7% per year
    const degradationFactor = Math.pow(1 - 0.007, years)
    return baseProduction * degradationFactor
  }
  
  return baseProduction
}

function tinhSanLuongTieuThu(sanLuongSanXuat: number, tyLeTieuThu: number): number {
  return sanLuongSanXuat * (tyLeTieuThu / 100)
}

function tinhSanLuongTietKiem(soDienThucTe: number, sanLuongTieuThu: number): number {
  return Math.min(soDienThucTe, sanLuongTieuThu)
}

// Thêm hàm tính số điện từ tiền điện
function tinhSoDienTuTienDien(tienDien: number, electricityType: string, bacDien: { tu: number; den: number; gia: number }[], giaKinhDoanh: number): number {
  if (isNaN(tienDien) || tienDien <= 0) return 0;
  
  if (electricityType === "kinh-doanh") {
    // Đối với điện kinh doanh, công thức đơn giản hơn
    return Math.round(tienDien / giaKinhDoanh);
  } else {
    // Đối với điện sinh hoạt, cần tính ngược từ các bậc thang
    let soDien = 0;
    let tienConLai = tienDien;
    
    for (let i = 0; i < bacDien.length; i++) {
      const bac = bacDien[i];
      const khoangBac = bac.den - bac.tu;
      const tienToiDaBac = khoangBac * bac.gia;
      
      if (tienConLai <= tienToiDaBac) {
        // Nếu số tiền còn lại nhỏ hơn hoặc bằng tiền tối đa của bậc này
        soDien += Math.round(tienConLai / bac.gia);
        break;
      } else {
        // Nếu số tiền còn lại lớn hơn tiền tối đa của bậc này
        soDien += khoangBac;
        tienConLai -= tienToiDaBac;
      }
    }
    
    return soDien;
  }
}

export default function EfficiencyAnalysisPage() {
  // Define electricity pricing tiers
  const bacDienSinhHoat = [
    { tu: 0, den: 50, gia: 1893 },
    { tu: 51, den: 100, gia: 1956 },
    { tu: 101, den: 200, gia: 2271 },
    { tu: 201, den: 300, gia: 2860 },
    { tu: 301, den: 400, gia: 3197 },
    { tu: 401, den: Number.POSITIVE_INFINITY, gia: 3302 },
  ]

  const giaKinhDoanh = 2500 // Average commercial electricity price

  // State for basic information
  const [electricityType, setElectricityType] = useState("sinh-hoat")
  const [monthlyConsumption, setMonthlyConsumption] = useState(350) // kWh/month
  const [electricityCost, setElectricityCost] = useState("1948508")
  const [dayTimeUsagePercent, setDayTimeUsagePercent] = useState(90)

  // System parameters
  const [systemCapacity, setSystemCapacity] = useState(4.78) // Fixed value
  const [safetyRatio, setSafetyRatio] = useState(100)
  const [batteryOption, setBatteryOption] = useState("Không lắp")
  const [systemEfficiency, setSystemEfficiency] = useState(100) // 85% efficiency
  const [sunHoursPerDay, setSunHoursPerDay] = useState(5) // Average sun hours per day
  const [costPerKWp, setCostPerKWp] = useState(10_000_000) // Default 10,000,000 VND/kWp
  const [currentYear, setCurrentYear] = useState(0) // Year 0 is the first year of installation
  
  // Constants for calculations
  const batteryDepreciationRate = 0.7 // 0.7% battery depreciation per year
  const maintenanceCostPerKWp = 300_000 // 300,000 VND/kWp for operation and maintenance
  const VAT = 0.08 // 8% VAT on electricity and investment
  const solarPanelLifespan = 20 // Solar panel lifespan in years

  // Calculate investment efficiency
  const calculations = useMemo(() => {
    // Initial investment cost before VAT
    const initialInvestmentBeforeVAT = systemCapacity * costPerKWp * (safetyRatio / 100)
    
    // Initial investment cost with VAT
    const initialInvestment = initialInvestmentBeforeVAT * (1 + VAT)
    
    // Annual maintenance cost
    const annualMaintenanceCost = systemCapacity * maintenanceCostPerKWp
    
    // Total investment is initial investment only (maintenance costs are annual)
    const totalInvestment = initialInvestment

    // Calculate monthly electricity cost (either from input or calculate)
    let monthlyElectricityCost = Number.parseInt(electricityCost)
    if (isNaN(monthlyElectricityCost)) {
      // Calculate from consumption if not provided
      if (electricityType === "sinh-hoat") {
        monthlyElectricityCost = tinhTienDienSinhHoat(monthlyConsumption, bacDienSinhHoat)
      } else {
        monthlyElectricityCost = tinhTienDienKinhDoanh(monthlyConsumption, giaKinhDoanh)
      }
    }

    // Apply VAT
    const monthlyElectricityCostWithVAT = monthlyElectricityCost * (1 + VAT)

    // Calculate solar production
    const monthlySolarProduction = tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency)

    // Calculate solar consumption (based on daytime usage)
    const monthlySolarConsumption = tinhSanLuongTieuThu(monthlySolarProduction, dayTimeUsagePercent)

    // Calculate energy saved by solar
    const calculatedMonthlyConsumption = tinhSoDienTuTienDien(Number(electricityCost), electricityType, bacDienSinhHoat, giaKinhDoanh)
    const monthlySolarSavings = tinhSanLuongTietKiem(calculatedMonthlyConsumption, monthlySolarConsumption)

    // Calculate remaining grid consumption
    const remainingGridConsumption = calculatedMonthlyConsumption - monthlySolarSavings

    // Calculate new electricity bill
    let newMonthlyElectricityCost = 0
    if (electricityType === "sinh-hoat") {
      newMonthlyElectricityCost = tinhTienDienSinhHoat(remainingGridConsumption, bacDienSinhHoat)
    } else {
      newMonthlyElectricityCost = tinhTienDienKinhDoanh(remainingGridConsumption, giaKinhDoanh)
    }

    // Apply VAT to new bill
    const newMonthlyElectricityCostWithVAT = newMonthlyElectricityCost * (1 + VAT)

    // Calculate monthly savings
    const monthlySavings = monthlyElectricityCostWithVAT - newMonthlyElectricityCostWithVAT

    // Calculate annual savings (subtract maintenance costs)
    // const annualSavings = (monthlySavings * 12) - annualMaintenanceCost
    const annualSavings = (monthlySavings * 12)

    // Calculate solar panel lifespan savings with degradation and price increase
    let totalSavings = 0
    let yearlySavingsArray = [] // Array to store yearly savings for payback calculation
    let cashFlows = [-initialInvestment] // Initial investment as negative cash flow
    
    for (let year = 0; year < solarPanelLifespan; year++) {
      // Calculate production for this specific year with degradation
      const yearlyProduction = tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency, year)
      const yearlyConsumption = tinhSanLuongTieuThu(yearlyProduction, dayTimeUsagePercent)
      const yearlySavings = tinhSanLuongTietKiem(calculatedMonthlyConsumption, yearlyConsumption)
      
      // Calculate remaining consumption for this year
      const yearlyRemainingConsumption = calculatedMonthlyConsumption - yearlySavings
      
      // Calculate electricity cost for this year with price increase
      let yearlyElectricityCost = 0
      if (electricityType === "sinh-hoat") {
        yearlyElectricityCost = tinhTienDienSinhHoat(yearlyRemainingConsumption, bacDienSinhHoat)
      } else {
        yearlyElectricityCost = tinhTienDienKinhDoanh(yearlyRemainingConsumption, giaKinhDoanh)
      }
      
      // Apply annual electrical price increase
      const priceIncreaseFactor = Math.pow(1 + 0.04, year)
      
      // Calculate original electricity cost with price increase
      const originalElectricityCostWithIncrease = monthlyElectricityCost * priceIncreaseFactor
      const originalElectricityCostWithIncreaseAndVAT = originalElectricityCostWithIncrease * (1 + VAT)
      
      // Apply the same price increase to the new electricity cost
      yearlyElectricityCost *= priceIncreaseFactor
      const yearlyElectricityCostWithVAT = yearlyElectricityCost * (1 + VAT)
      
      // Calculate savings for this year with price increase
      const yearlyMonthlySavings = originalElectricityCostWithIncreaseAndVAT - yearlyElectricityCostWithVAT
      
      // Subtract annual maintenance cost from the yearly savings
      const yearlyTotalSavings = (yearlyMonthlySavings * 12) - annualMaintenanceCost
      totalSavings += yearlyTotalSavings
      
      // Store yearly savings for payback calculation
      yearlySavingsArray.push(yearlyTotalSavings)
      
      // Add to cash flows for IRR calculation
      cashFlows.push(yearlyTotalSavings)
    }

    // Calculate IRR (Internal Rate of Return)
    const irr = calculateIRR(cashFlows)

    // Calculate ROI more accurately
    const roi = (totalSavings / totalInvestment) * 100

    // Calculate payback period in years more accurately
    let cumulativeSavings = 0
    let paybackPeriod = solarPanelLifespan // Default to max lifespan
    let paybackYear = -1;
    let cumulativeSavingsArray = [];
    
    for (let year = 0; year < yearlySavingsArray.length; year++) {
      cumulativeSavings += yearlySavingsArray[year];
      cumulativeSavingsArray.push(cumulativeSavings);
      
      if (cumulativeSavings >= totalInvestment && paybackYear === -1) {
        paybackYear = year;
      }
    }
    
    if (paybackYear > 0) {
      // Apply the Excel formula logic:
      // =MAX($H86:$AA86)+-INDEX($H85:$AA85;;MAX($H86:$AA86)-1)/INDEX($H84:$AA84;;MAX($H86:$AA86))
      // Where:
      // - $H86:$AA86 is the year index where cumulative savings exceeds investment
      // - $H85:$AA85 is the cumulative savings array
      // - $H84:$AA84 is the yearly savings array
      
      const previousYearCumulativeSavings = cumulativeSavingsArray[paybackYear - 1];
      const currentYearSavings = yearlySavingsArray[paybackYear];
      
      paybackPeriod = paybackYear + (totalInvestment - previousYearCumulativeSavings) / currentYearSavings;
    }

    return {
      initialInvestmentBeforeVAT,
      initialInvestment,
      annualMaintenanceCost,
      totalInvestment,
      monthlyElectricityCost,
      monthlyElectricityCostWithVAT,
      monthlySolarProduction,
      monthlySolarConsumption,
      monthlySolarSavings,
      remainingGridConsumption,
      newMonthlyElectricityCost,
      newMonthlyElectricityCostWithVAT,
      monthlySavings,
      annualSavings,
      totalSavings,
      roi,
      paybackPeriod,
      irr, // Add IRR to the return object
    }
  }, [
    electricityType,
    electricityCost,
    dayTimeUsagePercent,
    systemCapacity,
    safetyRatio,
    systemEfficiency,
    sunHoursPerDay,
    costPerKWp,
    currentYear,
    // No need to add constants to dependencies as they don't change
  ])

  // Format number with commas
  const formatNumber = (num: number) => {
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Home button */}
        <div className="flex justify-end mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home size={18} />
              <span>Trang chủ</span>
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Phân Tích Hiệu Quả Đầu Tư Điện Mặt Trời</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information Card */}
          <Card>
            <CardHeader className="bg-blue-900 text-white rounded-t-lg">
              <CardTitle>1. Thông Tin Cơ Bản</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="electricity-cost" className="text-sm font-medium">
                  Tiền điện chưa VAT
                </Label>
                <Input
                  id="electricity-cost"
                  value={electricityCost}
                  onChange={(e) => setElectricityCost(e.target.value.replace(/[^0-9]/g, ""))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">VND</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Giá điện</Label>
                <div className="flex space-x-4 mt-1">
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
                    <Label htmlFor="sinh-hoat" className="cursor-pointer">
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
                    <Label htmlFor="kinh-doanh" className="cursor-pointer">
                      Kinh doanh
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="monthly-consumption" className="text-sm font-medium">
                  Số điện sử dụng hàng tháng
                </Label>
                <div className="flex items-center">
                  <Input
                    id="monthly-consumption"
                    value={tinhSoDienTuTienDien(Number(electricityCost), electricityType, bacDienSinhHoat, giaKinhDoanh)}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <span className="ml-2">kWh</span>
                </div>
              </div>

              <div>
                <Label htmlFor="daytime-usage" className="text-sm font-medium">
                  Mức sử dụng điện từ 6h-17h
                </Label>
                <div className="px-2 mt-1">
                  <Slider
                    value={[dayTimeUsagePercent]}
                    onValueChange={(values) => setDayTimeUsagePercent(values[0])}
                    max={100}
                    step={5}
                    className="my-4"
                  />
                  <div className="flex justify-end">
                    <span className="inline-block bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-md">
                      {dayTimeUsagePercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Sản lượng điện mặt trời hàng tháng</Label>
                <div className="flex items-center mt-1">
                  <Input value={Math.round(calculations.monthlySolarProduction)} disabled className="bg-gray-100" />
                  <span className="ml-2">kWh</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Sản lượng tiêu thụ thực tế (theo giờ nắng)</Label>
                <div className="flex items-center mt-1">
                  <Input value={Math.round(calculations.monthlySolarConsumption)} disabled className="bg-gray-100" />
                  <span className="ml-2">kWh</span>
                </div>
              </div>
              
              {/* Thêm component hiển thị sản lượng điện theo thời gian */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Sản lượng điện theo thời gian</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-blue-700">Tháng đầu tiên</Label>
                    <div className="flex items-center mt-1">
                      <Input 
                        value={Math.round(tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency, 0))} 
                        disabled 
                        className="bg-white border-blue-200" 
                      />
                      <span className="ml-2 text-sm">kWh</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-blue-700">Tháng thứ 2</Label>
                    <div className="flex items-center mt-1">
                      <Input 
                        value={Math.round(tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency, 1/12))} 
                        disabled 
                        className="bg-white border-blue-200" 
                      />
                      <span className="ml-2 text-sm">kWh</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Giảm {((1 - Math.pow(1 - 0.007, 1/12)) * 100).toFixed(3)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Efficiency Card */}
          <Card>
            <CardHeader className="bg-amber-600 text-white rounded-t-lg">
              <CardTitle>2. Hiệu Quả Đầu Tư</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Công suất khuyến nghị</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      type="number"
                      value={systemCapacity}
                      onChange={(e) => setSystemCapacity(Number(e.target.value))}
                      className="mt-1"
                      step="0.1"
                    />
                    <span className="ml-2">kWp</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="safety-ratio" className="text-sm font-medium">
                    Tỷ lệ an toàn
                  </Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="safety-ratio"
                      type="number"
                      min="1"
                      max="100"
                      value={safetyRatio}
                      onChange={(e) => setSafetyRatio(Number(e.target.value))}
                      className="mt-1"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="cost-per-kwp" className="text-sm font-medium">
                  Chi phí đầu tư
                </Label>
                <div className="flex items-center mt-1">
                  <Input
                    id="cost-per-kwp"
                    type="number"
                    value={costPerKWp}
                    onChange={(e) => setCostPerKWp(Number(e.target.value))}
                    className="mt-1"
                    step="100000"
                  />
                  <span className="ml-2">VND/kWp</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Chọn bộ lưu điện</Label>
                <Select value={batteryOption} onValueChange={setBatteryOption}>
                  <SelectTrigger className="w-full">
                    {batteryOption || "Chọn bộ lưu điện"}
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="Không lắp" className="py-1 text-xs">
                      Không lắp
                    </SelectItem>
                    <SelectItem value="5kWh" className="py-1 text-xs">
                      5kWh
                    </SelectItem>
                    <SelectItem value="10kWh" className="py-1 text-xs">
                      10kWh
                    </SelectItem>
                    <SelectItem value="15kWh" className="py-1 text-xs">
                      15kWh
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tổng chi phí đầu tư ước tính (đã bao gồm VAT 8%)</Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNumber(calculations.initialInvestment)}
                    disabled
                    className="bg-yellow-50 font-medium"
                  />
                  <span className="ml-2">VND</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(calculations.initialInvestment / systemCapacity)} VND/kWp
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Chi phí vận hành và bảo trì (12 tháng)</Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNumber(calculations.annualMaintenanceCost)}
                    disabled
                    className="bg-yellow-50 font-medium"
                  />
                  <span className="ml-2">VND</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(calculations.annualMaintenanceCost)} VND/năm
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Tổng chi phí đầu tư và vận hành</Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNumber(calculations.totalInvestment)}
                    disabled
                    className="bg-yellow-50 font-bold"
                  />
                  <span className="ml-2">VND</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-800">Chi phí điện hiện tại mỗi tháng</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(Number(electricityCost) * (1 + VAT))}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-800">Chi phí điện sau khi lắp điện mặt trời</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.newMonthlyElectricityCostWithVAT)}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-800">Số tiền tiết kiệm được trong tháng đầu</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.monthlySavings)}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-800">Số tiền tiết kiệm được trong năm đầu</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.annualSavings)}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-800">Tổng số tiền tiết kiệm được trong {solarPanelLifespan} năm</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.totalSavings)}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-amber-800">Lợi nhuận đầu tư</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={`${calculations.roi.toFixed(2)}%`}
                      disabled
                      className="bg-white font-bold text-amber-700 border-amber-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-amber-800">Thời gian thu hồi vốn</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={calculations.paybackPeriod.toFixed(1)}
                      disabled
                      className="bg-white font-bold text-amber-700 border-amber-200"
                    />
                    <span className="ml-2 font-medium text-amber-700">năm</span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-amber-800">Tỷ suất hoàn vốn nội bộ (IRR)</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={`${isNaN(calculations.irr) ? "N/A" : calculations.irr.toFixed(2) + "%"}`}
                      disabled
                      className="bg-white font-bold text-amber-700 border-amber-200"
                    />
                    <span className="ml-2 font-medium text-amber-700">
                      <span className="text-xs text-amber-600 cursor-help" title="IRR là tỷ lệ chiết khấu làm cho NPV của tất cả các dòng tiền bằng 0">ⓘ</span>
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    IRR là tỷ suất sinh lời kỳ vọng của dự án, càng cao càng tốt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col gap-4 max-w-xl mx-auto">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white py-6 px-8 text-lg font-bold rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 active:scale-95">
            Yêu cầu kỹ thuật viên tới khảo sát chi tiết và lắp đặt ngay hôm nay
          </Button>

          <Link href="/phan-tich-tai-chinh">
            <Button
              variant="outline"
              className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 py-6 px-8 text-lg font-bold rounded-lg transform transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              Xem thêm phương án trả chậm
            </Button>
          </Link>

          <Link href="/ho-so">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg font-bold rounded-lg transform transition-transform duration-300 hover:scale-105 active:scale-95">
              Nộp hồ sơ trực tuyến
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

