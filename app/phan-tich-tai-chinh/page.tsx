"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Home } from "lucide-react"

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

function tinhSanLuongDien(capacity: number, sunHours: number, efficiency: number): number {
  return capacity * sunHours * 30 * (efficiency / 100)
}

function tinhSanLuongTieuThu(sanLuongSanXuat: number, tyLeTieuThu: number): number {
  return sanLuongSanXuat * (tyLeTieuThu / 100)
}

function tinhSanLuongTietKiem(soDienThucTe: number, sanLuongTieuThu: number): number {
  return Math.min(soDienThucTe, sanLuongTieuThu)
}

export default function FinancialAnalysisPage() {
  // Define electricity pricing tiers
  const bacDienSinhHoat = [
    { tu: 0, den: 50, gia: 1678 },
    { tu: 50, den: 100, gia: 1734 },
    { tu: 100, den: 200, gia: 2014 },
    { tu: 200, den: 300, gia: 2536 },
    { tu: 300, den: 400, gia: 2834 },
    { tu: 400, den: Number.POSITIVE_INFINITY, gia: 2927 },
  ]

  const giaKinhDoanh = 2500 // Average commercial electricity price
  const VAT = 0.08 // 8% VAT on electricity

  // System information state
  const [systemCapacity, setSystemCapacity] = useState(4.8) // kWp
  const [totalInvestment, setTotalInvestment] = useState(72000000) // VND, 15,000,000 per kWp
  const [sunHoursPerDay, setSunHoursPerDay] = useState(5) // Average sun hours per day
  const [systemEfficiency, setSystemEfficiency] = useState(85) // 85% efficiency

  // Customer usage state
  const [electricityType, setElectricityType] = useState("sinh-hoat")
  const [monthlyConsumption, setMonthlyConsumption] = useState(350) // kWh/month
  const [daytimeUsagePercent, setDaytimeUsagePercent] = useState(70)

  // Installment options
  const [installmentRate, setInstallmentRate] = useState(80)
  const [installmentTerm, setInstallmentTerm] = useState(3)
  const [interestRate, setInterestRate] = useState(6.62) // 6.62% annual interest rate

  // Calculated values using the formulas
  const calculations = useMemo(() => {
    // Calculate base electricity cost without solar
    let monthlyElectricityCost = 0
    if (electricityType === "sinh-hoat") {
      monthlyElectricityCost = tinhTienDienSinhHoat(monthlyConsumption, bacDienSinhHoat)
    } else {
      monthlyElectricityCost = tinhTienDienKinhDoanh(monthlyConsumption, giaKinhDoanh)
    }

    // Apply VAT
    const monthlyElectricityCostWithVAT = monthlyElectricityCost * (1 + VAT)

    // Calculate solar production
    const monthlySolarProduction = tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency)

    // Calculate solar consumption (based on daytime usage)
    const monthlySolarConsumption = tinhSanLuongTieuThu(monthlySolarProduction, daytimeUsagePercent)

    // Calculate energy saved by solar
    const monthlySolarSavings = tinhSanLuongTietKiem(monthlyConsumption, monthlySolarConsumption)

    // Calculate remaining grid consumption
    const remainingGridConsumption = monthlyConsumption - monthlySolarSavings

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
    const monthlyCostSavings = monthlyElectricityCostWithVAT - newMonthlyElectricityCostWithVAT

    // Calculate annual savings
    const annualCostSavings = monthlyCostSavings * 12

    // Calculate 25-year savings (solar panel lifespan)
    const lifetimeSavings = annualCostSavings * 25

    // Calculate installment amount
    const installmentAmount = totalInvestment * (installmentRate / 100)

    // Calculate upfront payment
    const upfrontPayment = totalInvestment - installmentAmount

    // Calculate monthly payment with interest
    // P × r × (1 + r)^n / ((1 + r)^n - 1)
    // where P is the loan amount, r is the monthly interest rate, and n is the number of payments
    const monthlyInterestRate = interestRate / 100 / 12
    const totalPayments = installmentTerm * 12

    const monthlyPayment =
      (installmentAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)

    // Calculate total payment over loan term
    const totalPayment = monthlyPayment * totalPayments

    // Calculate interest cost
    const interestCost = totalPayment - installmentAmount

    // Calculate net monthly savings (monthly electricity savings - monthly loan payment)
    const netMonthlySavings = monthlyCostSavings - monthlyPayment

    // Calculate payback period in years
    const paybackPeriod = upfrontPayment > 0 ? upfrontPayment / annualCostSavings : 0

    // Calculate net savings over loan term (electricity savings - total loan payments)
    const savingsDuringLoanTerm = monthlyCostSavings * totalPayments - totalPayment

    // Calculate ROI
    const roi = (lifetimeSavings / totalInvestment) * 100

    return {
      // Monthly values
      monthlyElectricityCost,
      monthlyElectricityCostWithVAT,
      monthlySolarProduction,
      monthlySolarConsumption,
      monthlySolarSavings,
      remainingGridConsumption,
      newMonthlyElectricityCost,
      newMonthlyElectricityCostWithVAT,
      monthlyCostSavings,

      // Annual and lifetime values
      annualCostSavings,
      lifetimeSavings,

      // Investment values
      installmentAmount,
      upfrontPayment,
      monthlyPayment,
      totalPayment,
      interestCost,

      // Performance metrics
      netMonthlySavings,
      paybackPeriod,
      savingsDuringLoanTerm,
      roi,
    }
  }, [
    electricityType,
    monthlyConsumption,
    daytimeUsagePercent,
    systemCapacity,
    sunHoursPerDay,
    systemEfficiency,
    totalInvestment,
    installmentRate,
    installmentTerm,
    interestRate,
  ])

  // Format number with commas
  const formatNumber = (num: number) => {
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Format negative numbers with parentheses
  const formatNegativeNumber = (num: number) => {
    if (num < 0) {
      return `(${formatNumber(Math.abs(num))})`
    }
    return formatNumber(num)
  }

  const [option, setOption] = useState("Option 1")

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

        <h1 className="text-3xl font-bold text-center mb-8 text-red-600">Phân Tích Tài Chính Đầu Tư Điện Mặt Trời</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Usage and System Information Card */}
          <Card>
            <CardHeader className="bg-blue-900 text-white rounded-t-lg">
              <CardTitle>1. Thông Tin Sử Dụng & Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">Loại điện</Label>
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
                    type="number"
                    value={monthlyConsumption}
                    onChange={(e) => setMonthlyConsumption(Number(e.target.value))}
                    className="mt-1"
                  />
                  <span className="ml-2">kWh</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ước tính hóa đơn điện: {formatNumber(calculations.monthlyElectricityCostWithVAT)} VND/tháng
                </p>
              </div>

              <div>
                <Label htmlFor="daytime-usage-percent" className="text-sm font-medium">
                  Mức sử dụng điện từ 6h-17h
                </Label>
                <div className="px-2 mt-1">
                  <Slider
                    id="daytime-usage-percent"
                    value={[daytimeUsagePercent]}
                    onValueChange={(values) => setDaytimeUsagePercent(values[0])}
                    max={100}
                    step={5}
                    className="my-4"
                  />
                  <div className="flex justify-end">
                    <span className="inline-block bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-md">
                      {daytimeUsagePercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Label htmlFor="system-capacity" className="text-sm font-medium">
                  Công suất hệ thống
                </Label>
                <div className="flex items-center">
                  <Input
                    id="system-capacity"
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
                <Label htmlFor="system-efficiency" className="text-sm font-medium">
                  Hiệu suất hệ thống
                </Label>
                <div className="flex items-center">
                  <Input
                    id="system-efficiency"
                    type="number"
                    value={systemEfficiency}
                    onChange={(e) => setSystemEfficiency(Number(e.target.value))}
                    className="mt-1"
                    max="100"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="total-investment" className="text-sm font-medium">
                  Tổng chi phí đầu tư ước tính
                </Label>
                <div className="flex items-center">
                  <Input
                    id="total-investment"
                    value={totalInvestment}
                    onChange={(e) => setTotalInvestment(Number(e.target.value.replace(/\D/g, "")))}
                    className="mt-1"
                  />
                  <span className="ml-2">VND</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Giá ước tính: {formatNumber(totalInvestment / systemCapacity)} VND/kWp
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">Sản lượng điện ước tính:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Sản lượng mỗi tháng:</div>
                  <div className="font-medium text-right">{Math.round(calculations.monthlySolarProduction)} kWh</div>

                  <div className="text-gray-600">Sản lượng tiêu thụ thực tế:</div>
                  <div className="font-medium text-right">{Math.round(calculations.monthlySolarConsumption)} kWh</div>

                  <div className="text-gray-600">Tiết kiệm được:</div>
                  <div className="font-medium text-right">{Math.round(calculations.monthlySolarSavings)} kWh</div>

                  <div className="text-gray-600">Tỷ lệ tiết kiệm:</div>
                  <div className="font-medium text-right">
                    {Math.round((calculations.monthlySolarSavings / monthlyConsumption) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installment Options Card */}
          <Card>
            <CardHeader className="bg-red-600 text-white rounded-t-lg">
              <CardTitle>2. Phương Án Trả Chậm</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="installment-rate" className="text-sm font-medium">
                  Tỷ lệ trả chậm
                </Label>
                <div className="px-2 mt-1">
                  <Slider
                    id="installment-rate"
                    value={[installmentRate]}
                    onValueChange={(values) => setInstallmentRate(values[0])}
                    max={100}
                    step={10}
                    className="my-4"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="inline-block bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded-md">
                      {installmentRate}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="installment-term" className="text-sm font-medium">
                  Thời hạn trả chậm
                </Label>
                <div className="px-2 mt-1">
                  <Slider
                    id="installment-term"
                    value={[installmentTerm]}
                    onValueChange={(values) => setInstallmentTerm(values[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">1 năm</span>
                    <span className="inline-block bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded-md">
                      {installmentTerm} năm
                    </span>
                    <span className="text-sm text-gray-500">5 năm</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="interest-rate" className="text-sm font-medium">
                  Lãi suất năm
                </Label>
                <div className="flex items-center">
                  <Input
                    id="interest-rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="mt-1"
                    step="0.01"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Số tiền trả chậm</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.installmentAmount)}
                      disabled
                      className="bg-yellow-50 font-medium"
                    />
                    <span className="ml-2">VND</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Đặt cọc ban đầu</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.upfrontPayment)}
                      disabled
                      className="bg-yellow-50 font-medium"
                    />
                    <span className="ml-2">VND</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <Label className="text-sm font-medium text-gray-700">Chi phí trả góp hàng tháng</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.monthlyPayment)}
                      disabled
                      className="bg-white font-bold text-gray-700 border-gray-300"
                    />
                    <span className="ml-2 font-medium text-gray-700">VND</span>
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="text-sm font-medium text-gray-700">Tổng chi phí trả góp</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.totalPayment)}
                      disabled
                      className="bg-white font-bold text-gray-700 border-gray-300"
                    />
                    <span className="ml-2 font-medium text-gray-700">VND</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Chi phí lãi vay</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.interestCost)}
                      disabled
                      className="bg-white font-bold text-gray-700 border-gray-300"
                    />
                    <span className="ml-2 font-medium text-gray-700">VND</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-800">Tiết kiệm hàng tháng</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNumber(calculations.monthlyCostSavings)}
                      disabled
                      className="bg-white font-bold text-blue-700 border-blue-200"
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-800">
                    Tiết kiệm hàng tháng (sau khi trừ trả góp)
                  </Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={formatNegativeNumber(calculations.netMonthlySavings)}
                      disabled
                      className={`bg-white font-bold border-blue-200 ${
                        calculations.netMonthlySavings >= 0 ? "text-blue-700" : "text-red-500"
                      }`}
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-amber-800">Lợi nhuận đầu tư (ROI)</Label>
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
                      value={calculations.upfrontPayment > 0 ? calculations.paybackPeriod.toFixed(1) : "Không bỏ vốn"}
                      disabled
                      className="bg-white font-bold text-amber-700 border-amber-200"
                    />
                    {calculations.upfrontPayment > 0 && <span className="ml-2 font-medium text-amber-700">năm</span>}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-red-800">
                  Tiền điện tiết kiệm - Chi phí trả góp (trong thời hạn vay)
                </Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNegativeNumber(calculations.savingsDuringLoanTerm)}
                    disabled
                    className={`bg-white font-bold border-red-200 ${
                      calculations.savingsDuringLoanTerm >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  />
                  <span className="ml-2 font-medium text-red-800">VND</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {calculations.savingsDuringLoanTerm >= 0
                    ? "Bạn vẫn có lợi nhuận trong thời gian trả góp"
                    : "Bạn sẽ bắt đầu có lợi nhuận sau khi trả hết nợ"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Button */}
        <div className="mt-10 flex flex-col gap-4 max-w-xl mx-auto">
          <Button className="bg-red-600 hover:bg-red-700 text-white py-6 px-8 text-lg font-bold rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 active:scale-95">
            Phê duyệt hồ sơ và đầu tư {installmentRate === 100 ? "0 đồng" : "trả chậm"} ngay hôm nay
          </Button>

          <Link href="/ho-so">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg font-bold rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 active:scale-95">
              Nộp hồ sơ trực tuyến
            </Button>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="mt-6 text-center space-y-2">
          <div>
            <Link href="/phan-tich-hieu-qua" className="text-blue-600 hover:underline">
              Xem phân tích hiệu quả đầu tư
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

