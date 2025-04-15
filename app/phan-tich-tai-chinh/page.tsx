"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  bacDienSinhHoat,
  calculateIRR,
  calculateSystemCapacity,
  formatNegativeNumber,
  formatNumber,
  giaKinhDoanh,
  provincesSolarData,
  tinhSanLuongDien,
  tinhSanLuongTietKiem,
  tinhSanLuongTieuThu,
  tinhSoDienTuTienDien,
  tinhTienDienKinhDoanh,
  tinhTienDienSinhHoat,
  VAT
} from "@/lib/calculations"
import { Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

// Add this near the top of the file, after imports
const INTEREST_RATES = {
  1: 12.00, // 12% for 1 year
  2: 12.00, // 12% for 2 years
  3: 12.00, // 13% for 3 years
  4: 12.00, // 14% for 4 years
  5: 12.00, // 15% for 5 years
  6: 12.00, // 16% for 6 years
  7: 12.00  // 16% for 7 years
  // 2: 13.00, // 13% for 2 years
  // 3: 14.00, // 14% for 3 years
  // 4: 15.00, // 15% for 4 years
  // 5: 15.00, // 15% for 5 years
  // 6: 16.00, // 16% for 6 years
  // 7: 16.00  // 16% for 7 years
};

// Function to calculate total electricity cost over the system lifespan without solar panels
function calculateTotalElectricityCostWithoutSolar(
  monthlyConsumption: number,
  electricityType: string,
  monthlyElectricityCostWithVAT: number,
  solarPanelLifespan: number,
  VAT: number,
  bacDienSinhHoat: any,
  giaKinhDoanh: any
) {
  let totalCost = 0;
  
  for (let year = 0; year < solarPanelLifespan; year++) {
    // Apply annual electrical price increase (4% per year)
    const priceIncreaseFactor = Math.pow(1 + 0.04, year);
    
    // Calculate original electricity cost with price increase for this year
    const yearlyElectricityCostWithIncrease = monthlyElectricityCostWithVAT * 12 * priceIncreaseFactor;
    
    // Add to total cost
    totalCost += yearlyElectricityCostWithIncrease;
    
    console.log(`Debug - Year ${year} without solar: Electricity Cost = ${yearlyElectricityCostWithIncrease.toFixed(0)} VND`);
  }
  
  return totalCost;
}


// Function to calculate monthly payment (PMT formula)
function calculatePMT(rate, nper, pv, fv = 0, type = 0) {
  // rate: interest rate per period
  // nper: number of payment periods
  // pv: present value (loan amount)
  // fv: future value (default 0)
  // type: when payments are due (0: end of period, 1: beginning of period)

  if (rate === 0) return -(pv + fv) / nper;

  const pvif = Math.pow(1 + rate, nper);
  let pmt = rate / (pvif - 1) * -(pv * pvif + fv);

  if (type === 1) pmt /= (1 + rate);

  return pmt;
}



export default function FinancialAnalysisPage() {
  // No need to define electricity pricing tiers here anymore
  const searchParams = useSearchParams()
  
  // Get parameters from URL
  const locationParam = searchParams.get('location') || ""
  const usageTimeParam = searchParams.get('usageTime') || "90"
  const electricityCostParam = searchParams.get('monthlyUsage') || ""
  const electricityTypeParam = searchParams.get('electricityType') || "sinh-hoat"
  const monthlyConsumptionParam = searchParams.get('monthlyConsumption') || "0"
  console.log("Debug - electricityCostParam:", electricityCostParam)
  console.log("Debug - electricityTypeParam:", electricityTypeParam)
  console.log("Debug - monthlyConsumptionParam:", monthlyConsumptionParam)
  console.log("Debug - locationParam:", locationParam)
  console.log("Debug - usageTimeParam:", usageTimeParam)
  
  
  const [monthlyConsumption, setMonthlyConsumption] = useState(monthlyConsumptionParam) // Optional direct input of electricity cost
  
  const [location, setLocation] = useState(locationParam)
  
  // Find province data based on location
  const provinceData = useMemo(() => {
    return provincesSolarData.find(p => p.name === location) || 
           { name: "", production: 0, sunHours: 5 } // Default values if not found
  }, [location])

  // Set daytime usage from URL parameter
  const [daytimeUsagePercent, setDaytimeUsagePercent] = useState(
    parseInt(usageTimeParam, 10) || 90
  )
  
  const [safetyRatio, setSafetyRatio] = useState(90)
  
  // Use sunHours from province data
  const [sunHoursPerDay, setSunHoursPerDay] = useState(provinceData.sunHours || 5)
  
  const [productionPerLocation, setProductionPerLocation] = useState(provinceData.production || 0) // kWh/kWp
    // Update sunHours when location changes
  useEffect(() => {
    if (provinceData.production) {
      setProductionPerLocation(provinceData.production)
    }
  }, [provinceData])
  // Calculate system capacity dynamically
  const [systemCapacity, setSystemCapacity] = useState(() => 
    calculateSystemCapacity(
      +monthlyConsumption, 
      daytimeUsagePercent, 
      productionPerLocation, 
      safetyRatio
    )
  )

  console.log("Debug - systemCapacityyy:", systemCapacity)
  
  // Update system capacity when relevant parameters change
  useEffect(() => {
    const newCapacity = calculateSystemCapacity(
      +monthlyConsumption,
      daytimeUsagePercent,
      productionPerLocation,
      safetyRatio
    )
    // setSystemCapacity(newCapacity)
  }, [monthlyConsumption, daytimeUsagePercent, productionPerLocation, safetyRatio])
  
  // Update sunHours when location changes
  useEffect(() => {
    if (provinceData.sunHours) {
      setSunHoursPerDay(provinceData.sunHours)
    }
  }, [provinceData])

  const [costPerKWp, setCostPerKWp] = useState(10_000_000) // Default 10,000,000 VND/kWp
  const [systemEfficiency, setSystemEfficiency] = useState(100) // 85% efficiency

  // Customer usage state
  const [electricityType, setElectricityType] = useState(electricityTypeParam)
  const [electricityCost, setElectricityCost] = useState(electricityCostParam) // Optional direct input of electricity cost

  // Installment options
  const [installmentRate, setInstallmentRate] = useState(90) // % of total investment to be financed

    // Update the interest rate state and remove direct setting
  const [installmentTerm, setInstallmentTerm] = useState(3) // years
  const [interestRate, setInterestRate] = useState(INTEREST_RATES[3]) // Initialize with 3-year rate
    // Add effect to update interest rate when installment term changes
  useEffect(() => {
    setInterestRate(INTEREST_RATES[installmentTerm as keyof typeof INTEREST_RATES])
  }, [installmentTerm])

  // Constants for calculations
  const batteryDepreciationRate = 0.7 // 0.7% battery depreciation per year
  const maintenanceCostPerKWp = 300_000 // 300,000 VND/kWp for operation and maintenance
  const solarPanelLifespan = 20 // Solar panel lifespan in years

    // Calculate monthly payment with interest using PMT function
    const monthlyInterestRate = interestRate / 100 / 12
    console.log('Debug - monthlyInterestRate:', monthlyInterestRate)
    const totalPayments = installmentTerm * 12
    const [totalInvestment, setTotalInvestment] = useState(() => {
      // Calculate initial investment cost before VAT
      const initialInvestmentBeforeVAT = systemCapacity * costPerKWp

      // Calculate total investment including VAT
      return initialInvestmentBeforeVAT * (1 + VAT)
    }) // VND

    // Calculate the upfront payment (what the customer actually pays initially)
    const upfrontPayment = Math.ceil(totalInvestment * (1 - installmentRate / 100))

    // Calculate installment amount (amount to be financed)
    const installmentAmount = totalInvestment * (installmentRate / 100)

    const monthlyPayment: number[] = []

    // Calculate investment efficiency
  const calculations = useMemo(() => {
    // Initial investment cost before VAT
    const initialInvestmentBeforeVAT =
      systemCapacity * costPerKWp * (safetyRatio / 100)

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
        monthlyElectricityCost = tinhTienDienSinhHoat(
          +monthlyConsumption,
          bacDienSinhHoat
        )
      } else {
        monthlyElectricityCost = tinhTienDienKinhDoanh(
          +monthlyConsumption,
          giaKinhDoanh
        )
      }
    }

    // Apply VAT
    const monthlyElectricityCostWithVAT = monthlyElectricityCost

    // Calculate solar production
    const monthlySolarProduction = tinhSanLuongDien(
      systemCapacity,
      productionPerLocation,
      systemEfficiency
    )

    // Calculate solar consumption (based on daytime usage)
    const monthlySolarConsumption = tinhSanLuongTieuThu(
      monthlySolarProduction,
    )

    // Calculate energy saved by solar
    const calculatedMonthlyConsumption = electricityCost
      ? tinhSoDienTuTienDien(
          Number(+electricityCost/(1+VAT)),
          electricityType,
          bacDienSinhHoat,
        )
      : +monthlyConsumption

    const monthlySolarSavings = tinhSanLuongTietKiem(
      calculatedMonthlyConsumption,
      monthlySolarConsumption
    )

    // Calculate remaining grid consumption
    const remainingGridConsumption =
      calculatedMonthlyConsumption - monthlySolarSavings

    // Calculate new electricity bill
    let newMonthlyElectricityCost = 0
    if (electricityType === "sinh-hoat") {
      newMonthlyElectricityCost = tinhTienDienSinhHoat(
        remainingGridConsumption,
        bacDienSinhHoat
      )
    } else {
      newMonthlyElectricityCost = tinhTienDienKinhDoanh(
        remainingGridConsumption,
        giaKinhDoanh
      )
    }

    // Apply VAT to new bill
    const newMonthlyElectricityCostWithVAT =
      newMonthlyElectricityCost * (1 + VAT)

    // Calculate monthly savings
    const monthlyCostSavings =
      monthlyElectricityCostWithVAT - newMonthlyElectricityCostWithVAT

    // Calculate annual savings
    const annualCostSavings = monthlyCostSavings * 12

    // Calculate solar panel lifespan savings with degradation and price increase

    // For IRR calculation, we need the initial investment as the first element (year 0)
    // and then the net cash flows for each subsequent year
    let cashFlows = []

    console.log("-------------------------------------------")
    console.log("Debug - Total Investment:", totalInvestment)
    console.log("Debug - Monthly Consumption:", calculatedMonthlyConsumption)
    console.log("Debug - System Capacity:", systemCapacity)
    function tinhTongNo(
      goc: number,
      laiSuatNam: number,
      thang: number
    ): number {
      const laiSuatThang: number = laiSuatNam / 12
      const tienLai: number = goc * laiSuatThang * thang
      const tongPhaiTra: number = goc + tienLai
      return tongPhaiTra
    }

    
    const yearlySavings: number[] = []
    let loanPaymentLeft = totalPayments
    let interestCost = 0
    let totalSavings = 0
    let monthlyLoanPayment = Math.ceil(
              calculatePMT(
                monthlyInterestRate,
                loanPaymentLeft,
                +installmentAmount.toString(),
                0,
                0
              )
            )


    let savingsDuringLoanTerm = 0
    let copyMonthlyLoanPayment = monthlyLoanPayment
    let monthSaving = 0
    let savingsAfterLoanTerm = 0 
    let copyUpfrontPayment = upfrontPayment
    cashFlows.push(-upfrontPayment)
    for (let year = 0; year < solarPanelLifespan; year++) {
      const monthlyCostSavingWithPriceIncrease = 
        Math.floor(monthlyCostSavings * Math.pow(1 + 0.04, year))
   
      console.log(`Debug - Year ${year}: Debt paid off, ${monthlyCostSavingWithPriceIncrease}`)
      if (yearlySavings[year] === undefined) yearlySavings[year] = (0)

      yearlySavings[year] = monthlyCostSavingWithPriceIncrease * (12) + copyMonthlyLoanPayment * 12 - annualMaintenanceCost
      if (savingsDuringLoanTerm == 0) {
          savingsDuringLoanTerm = monthlyCostSavingWithPriceIncrease + copyMonthlyLoanPayment
      }


      if (copyUpfrontPayment > 0) {
        for (let month = 0; month < 12; month++) {
          const save = (monthlyCostSavingWithPriceIncrease + copyMonthlyLoanPayment) - annualMaintenanceCost/12
          copyUpfrontPayment -= save
          
          if (copyUpfrontPayment > 0) {
            monthSaving++
          }
          if (copyUpfrontPayment <= 0) {
            copyMonthlyLoanPayment = 0
          }
      
        }  
      } else {
        savingsAfterLoanTerm += yearlySavings[year] - annualMaintenanceCost
      }

      cashFlows.push(yearlySavings[year])


      console.log(
        `Debug - Year ${year}: Yearly Savings = ${yearlySavings[year]} VND`
      )
      totalSavings = totalSavings + yearlySavings[year]
    }

    console.log("irr", cashFlows)

    monthSaving = monthSaving / 12

    const totalPayment = monthlyLoanPayment * installmentTerm * 12
    // // Calculate savings after loan term
    // const savingsAfterLoanTermBigInt = totalSavings + totalPayment
    const copy = totalSavings
    const roi = (+copy.toString() / upfrontPayment) * 100
    interestCost = -totalPayment - installmentAmount

    const irr = calculateIRR(cashFlows)


    const totalElectricityCostWithoutSolar =
      calculateTotalElectricityCostWithoutSolar(
        calculatedMonthlyConsumption,
        electricityType,
        monthlyElectricityCostWithVAT,
        solarPanelLifespan,
        VAT,
        bacDienSinhHoat,
        giaKinhDoanh
      )
    const lifetimeSavings = savingsAfterLoanTerm + savingsDuringLoanTerm * installmentTerm * 12
    return {
      // Monthly values
      monthlyLoanPayment: -monthlyLoanPayment,
      monthlyElectricityCost,
      monthlyElectricityCostWithVAT,
      monthlySolarProduction,
      monthlySolarConsumption,
      monthlySolarSavings,
      remainingGridConsumption,
      newMonthlyElectricityCost,
      newMonthlyElectricityCostWithVAT,
      calculatedMonthlyConsumption,
      monthlyCostSavings,
      totalPayment,

      // Annual and lifetime values
      annualCostSavings,
      lifetimeSavings,

      // Investment values
      totalInvestment,
      installmentAmount,
      upfrontPayment,
      // totalPayment,
      interestCost,

      // Performance metrics
      // netMonthlySavings,
      // paybackPeriod,
      savingsDuringLoanTerm,
      savingsAfterLoanTerm,
      roi,
      irr,
      monthSaving,

      // Add the total electricity cost without solar to the returned object
      totalElectricityCostWithoutSolar,
    }
  }, [
    electricityType,
    monthlyConsumption,
    electricityCost,
    daytimeUsagePercent,
    systemCapacity,
    costPerKWp,
    safetyRatio,
    sunHoursPerDay,
    systemEfficiency,
    totalInvestment,
    installmentRate,
    installmentTerm,
    interestRate,
  ])

  const [option, setOption] = useState("Option 1")

  return (
    // You could have a loading skeleton as the `fallback` too
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
          <Card className="mt-8 mb-8">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle>Tổng Kết Tiết Kiệm Trong Vòng Đời Hệ Thống ({solarPanelLifespan} năm)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Trong thời gian trả góp ({installmentTerm} năm)</h3>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatNegativeNumber(((+calculations.savingsDuringLoanTerm)*installmentTerm*12)).toString()} VND
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {calculations.savingsDuringLoanTerm >= 0
                      ? "Tiết kiệm ngay từ đầu"
                      : "Chi phí nhiều hơn tiết kiệm"}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Sau khi trả hết nợ ({solarPanelLifespan - installmentTerm} năm)</h3>
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(+calculations.savingsAfterLoanTerm.toString())} VND
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Trung bình {formatNumber(+calculations.savingsAfterLoanTerm.toString() / (solarPanelLifespan - installmentTerm))} VND/năm
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">Tổng tiết kiệm ({solarPanelLifespan} năm)</h3>
                  <div className="text-2xl font-bold text-amber-700">
                    {formatNumber(+calculations.lifetimeSavings.toString())} VND
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    IRR: {formatNumber(+calculations.irr.toString())}% | Thu hồi vốn: {calculations.monthSaving} năm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Usage and System Information Card */}
          <Card>
            <CardHeader className="bg-blue-900 text-white rounded-t-lg">
              <CardTitle>1. Thông Tin Sử Dụng & Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">

              <div>
                <Label className="text-sm font-medium">Giá điện</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
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
                    <Label htmlFor="sinh-hoat" className="cursor-pointer text-sm">
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
                    <Label htmlFor="kinh-doanh-duoi-6kv" className="cursor-pointer text-sm">
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
                    <Label htmlFor="kinh-doanh-6kv-22kv" className="cursor-pointer text-sm">
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
                    <Label htmlFor="kinh-doanh-tren-22kv" className="cursor-pointer text-sm">
                      Kinh doanh từ 22kV trở lên
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
                    onChange={(e) => setMonthlyConsumption(Number(e.target.value).toString())}
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
                {location && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Vị trí lắp đặt</Label>
                    <div className="mt-1 p-2 bg-blue-50 rounded-md">
                      <p className="font-medium">{location}</p>
                      <p className="text-xs text-gray-600">Số giờ nắng: {sunHoursPerDay} giờ/ngày</p>
                    </div>
                  </div>
                )}
                
                <Label htmlFor="system-capacity" className="text-sm font-medium">
                  Công suất hệ thống
                </Label>
                <div className="flex items-center">
                  <Input
                    id="system-capacity"
                    type="number"
                    value={systemCapacity}
                    disabled
                    // onChange={(e) => setSystemCapacity(Number(e.target.value))}
                    className="mt-1"
                    step="0.1"
                  />
                  <span className="ml-2">kWp</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Công suất được tính tự động dựa trên mức tiêu thụ điện và số giờ nắng tại {location || "khu vực của bạn"}
                </p>
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
                    {Math.round((calculations.monthlySolarSavings / +monthlyConsumption) * 100)}%
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
                    min={10}
                    max={100}
                    step={10}
                    className="my-4"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">10%</span>
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
                    disabled
                    className="mt-1"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lãi suất được tính tự động theo thời hạn trả chậm
                </p>
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
                      value={formatNumber(calculations.monthlyLoanPayment)}
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
                      value={formatNumber(-+calculations.totalPayment.toString())}
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
                      value={formatNumber(+calculations.interestCost.toString())}
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
                      value={formatNegativeNumber(calculations.savingsDuringLoanTerm)}
                      disabled
                      className={`bg-white font-bold border-blue-200 ${
                        calculations.savingsDuringLoanTerm >= 0 ? "text-blue-700" : "text-red-500"
                      }`}
                    />
                    <span className="ml-2 font-medium text-blue-700">VND</span>
                  </div>
                </div> 
              </div>

              <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-amber-800">Tỉ suất đầu tư (IRR)</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={`${formatNumber(calculations.irr)}%`}
                      disabled
                      className="bg-white font-bold text-amber-700 border-amber-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-amber-800">Thời gian thu hồi vốn</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={calculations.monthSaving}
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
                    value={formatNegativeNumber(+calculations.savingsDuringLoanTerm*installmentTerm*12).toString()}
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

              <div className="bg-green-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-green-800">
                  Tiết kiệm sau khi trả hết nợ ({solarPanelLifespan - installmentTerm} năm còn lại)
                </Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNumber(+calculations.savingsAfterLoanTerm.toString())}
                    disabled
                    className="bg-white font-bold text-green-600 border-green-200"
                  />
                  <span className="ml-2 font-medium text-green-800">VND</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Sau khi trả hết nợ, bạn sẽ tiết kiệm được khoảng {formatNumber(+calculations.savingsAfterLoanTerm.toString() / (solarPanelLifespan - installmentTerm))} VND mỗi năm
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Summary Card */}


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
