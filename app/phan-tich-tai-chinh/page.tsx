"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  bacDienSinhHoat,
  formatNegativeNumber,
  formatNumber,
  giaKinhDoanh,
  tinhSanLuongDien,
  tinhSanLuongTietKiem,
  tinhSanLuongTieuThu,
  tinhTienDienKinhDoanh,
  tinhTienDienSinhHoat
} from "@/lib/calculations"
import { Home } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

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

// Function to estimate electricity consumption from bill amount
function tinhSoDienTuTienDien(tienDien, loaiDien, bacDien, giaKinhDoanh) {
  if (!tienDien || tienDien <= 0) return 0;

  // Remove VAT from the bill amount
  const tienDienTruocVAT = tienDien / 1.08;

  if (loaiDien === "sinh-hoat") {
    // Binary search to find the consumption that results in this bill
    let min = 0;
    let max = 10000; // Reasonable upper limit

    while (max - min > 1) {
      const mid = Math.floor((min + max) / 2);
      const calculatedBill = tinhTienDienSinhHoat(mid, bacDien);

      if (calculatedBill < tienDienTruocVAT) {
        min = mid;
      } else {
        max = mid;
      }
    }

    return min;
  } else {
    // For commercial, it's a simple division
    return tienDienTruocVAT / giaKinhDoanh[0].gia;
  }
}

export default function FinancialAnalysisPage() {
  // No need to define electricity pricing tiers here anymore
  const VAT = 0.08 // 8% VAT on electricity

  // System information state
  const [systemCapacity, setSystemCapacity] = useState(4.8) // kWp
  const [costPerKWp, setCostPerKWp] = useState(10_000_000) // Default 10,000,000 VND/kWp
  const [safetyRatio, setSafetyRatio] = useState(100) // Safety ratio

  const [sunHoursPerDay, setSunHoursPerDay] = useState(5) // Average sun hours per day
  const [systemEfficiency, setSystemEfficiency] = useState(100) // 85% efficiency

  // Customer usage state
  const [electricityType, setElectricityType] = useState("sinh-hoat")
  const [monthlyConsumption, setMonthlyConsumption] = useState(679) // kWh/month
  const [daytimeUsagePercent, setDaytimeUsagePercent] = useState(90)
  const [electricityCost, setElectricityCost] = useState("") // Optional direct input of electricity cost

  // Use a single state for daytime usage
  const dayTimeUsagePercent = daytimeUsagePercent

  // Installment options
  const [installmentRate, setInstallmentRate] = useState(90) // % of total investment to be financed
  const [installmentTerm, setInstallmentTerm] = useState(3) // years
  const [interestRate, setInterestRate] = useState(6.62) // 6.62% annual interest rate

  // Constants for calculations
  const batteryDepreciationRate = 0.7 // 0.7% battery depreciation per year
  const maintenanceCostPerKWp = 300_000 // 300,000 VND/kWp for operation and maintenance
  const solarPanelLifespan = 20 // Solar panel lifespan in years

    // Calculate monthly payment with interest using PMT function
    const monthlyInterestRate = interestRate / 100 / 12
    const totalPayments = installmentTerm * 12
const [totalInvestment, setTotalInvestment] = useState(() => {
    // Calculate initial investment cost before VAT
    const initialInvestmentBeforeVAT = systemCapacity * costPerKWp * (safetyRatio / 100)

    // Calculate total investment including VAT
    return initialInvestmentBeforeVAT * (1 + VAT)
  }) // VND

    // Calculate the upfront payment (what the customer actually pays initially)
    const upfrontPayment = totalInvestment * (1 - installmentRate / 100)

    // Calculate installment amount (amount to be financed)
    const installmentAmount = totalInvestment * (installmentRate / 100)

    // Initial investment cost before VAT
    const initialInvestmentBeforeVAT = systemCapacity * costPerKWp * (safetyRatio / 100)

    // Initial investment cost with VAT

    // Annual maintenance cost
    const annualMaintenanceCost = systemCapacity * maintenanceCostPerKWp

    // Total investment is initial investment only (maintenance costs are annual)
  // Function to calculate average yearly savings after loan term
  const calculateAverageSavingsAfterLoan = (totalSavingsAfterLoan, remainingYears) => {
    if (remainingYears <= 0) return 0;
    return totalSavingsAfterLoan / remainingYears;
  }

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
    const calculatedMonthlyConsumption = electricityCost ?
      tinhSoDienTuTienDien(Number(electricityCost), electricityType, bacDienSinhHoat, giaKinhDoanh) :
      monthlyConsumption

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
    const monthlyCostSavings = monthlyElectricityCostWithVAT - newMonthlyElectricityCostWithVAT

    // Calculate annual savings
    const annualCostSavings = monthlyCostSavings * 12

    // Calculate solar panel lifespan savings with degradation and price increase
    let totalSavings = 0
    let yearlySavingsArray = [] // Array to store yearly savings for payback calculation

    // For IRR calculation, we need the initial investment as the first element (year 0)
    // and then the net cash flows for each subsequent year
    let cashFlows = []

    console.log('-------------------------------------------')
    console.log('Debug - Total Investment:', totalInvestment)
    console.log('Debug - Monthly Consumption:', calculatedMonthlyConsumption)
    console.log('Debug - System Capacity:', systemCapacity)

    for (let year = 0; year < solarPanelLifespan; year++) {
      // Calculate production for this specific year with degradation
      const yearlyProduction = tinhSanLuongDien(systemCapacity, sunHoursPerDay, systemEfficiency, year)
      console.log(`Debug - Year ${year}: Solar Production = ${yearlyProduction.toFixed(0)} kWh`)

      const yearlyConsumption = tinhSanLuongTieuThu(yearlyProduction, dayTimeUsagePercent)

      const yearlySavings = tinhSanLuongTietKiem(calculatedMonthlyConsumption * 12, yearlyConsumption) - annualMaintenanceCost

      // Calculate remaining consumption for this year
      const yearlyRemainingConsumption = (calculatedMonthlyConsumption * 12) - yearlySavings
      // console.log(`Debug - Year ${year}: Remaining Consumption = ${yearlyRemainingConsumption.toFixed(0)} kWh`)

      // Calculate electricity cost for this year with price increase
      let yearlyElectricityCost = monthlyElectricityCostWithVAT * 12

      // console.log(`Debug - Year ${year}: Electricity Cost = ${yearlyElectricityCost.toFixed(0)} VND`)

      // Apply annual electrical price increase
      const priceIncreaseFactor = Math.pow(1 + 0.04, year)

      // Apply the same price increase to the new electricity cost
      yearlyElectricityCost *= priceIncreaseFactor

      // Calculate savings for this year with price increase
      const yearlyMonthlySavings = (yearlyElectricityCost - yearlyRemainingConsumption) / 12


      // Subtract annual maintenance cost and loan payment from the yearly savings
      const yearlyTotalSavings = ((yearlyMonthlySavings) * 12) - annualMaintenanceCost
      totalSavings += yearlyTotalSavings

      // Store yearly savings for payback calculation
      yearlySavingsArray.push(yearlyTotalSavings)

      // For IRR calculation, we add the yearly cash flow (which is just the savings for that year)
      // This is correct because the initial investment is already accounted for in the first element
      cashFlows.push(year == 0 ? -totalInvestment + yearlyTotalSavings
        : yearlyTotalSavings
      )
    }


    // Use the PMT function for more accurate calculation
    const monthlyPayment = calculatePMT(monthlyInterestRate, totalPayments, installmentAmount, 0, 0)

    // Calculate total payment over loan term
    const totalPayment = Math.abs(monthlyPayment) * totalPayments

    // Calculate interest cost (total payments minus principal)
    const interestCost = totalPayment - installmentAmount

    // For debugging the loan amortization
    console.log('Debug - Loan Details:')
    console.log('  - Loan Amount:', installmentAmount)
    console.log('  - Monthly Payment:', Math.abs(monthlyPayment))
    console.log('  - Total Payments:', totalPayment)
    console.log('  - Interest Cost:', interestCost)

    console.log('Debug - Total Investment:', totalInvestment)
    console.log('Debug - Upfront Payment:', upfrontPayment)
    console.log('Debug - First monthly Loan Payment:', Math.abs(monthlyPayment))

    // Calculate net yearly savings (after loan payments) and track debt repayment
    let netYearlySavingsArray = []
    let remainingDebt = installmentAmount // Start with the full loan amount
    let debtRepaymentArray = [] // Track how much debt is repaid each year
    let remainingDebtArray = [] // Track remaining debt at the end of each year

    for (let year = 0; year < solarPanelLifespan; year++) {
      // Calculate electricity savings for this year (before loan payments)
      const yearlyElectricitySavings = yearlySavingsArray[year]

      // Calculate yearly loan payment (if still within loan term)
      let yearlyLoanPaymentTotal = 0

      if (year < installmentTerm) {
        // Calculate the actual loan payments for this specific year
        const startMonth = year * 12
        const endMonth = Math.min(startMonth + 12, installmentTerm * 12)

        // Sum up the monthly payments for this year
        for (let month = startMonth; month < endMonth; month++) {
          yearlyLoanPaymentTotal += Math.abs(monthlyPayment)
        }
      }

      // Calculate net savings after loan payments
      const yearlyNetSavings = yearlyElectricitySavings - yearlyLoanPaymentTotal
      netYearlySavingsArray.push(yearlyNetSavings)

      // Track debt repayment using amortization schedule
      // For each month in the year, calculate interest and principal portions
      let debtRepaidThisYear = 0

      if (year < installmentTerm) {
        // During loan term, calculate monthly amortization
        const startMonth = year * 12
        const endMonth = Math.min(startMonth + 12, installmentTerm * 12)

        for (let month = startMonth; month < endMonth; month++) {
          // Calculate interest for this month
          const monthlyInterest = remainingDebt * monthlyInterestRate

          // Principal payment is the total payment minus interest
          const principalPayment = Math.min(remainingDebt, Math.abs(monthlyPayment) - monthlyInterest)

          // Add to yearly principal repayment
          debtRepaidThisYear += principalPayment

          // Update remaining debt for next month's calculation
          remainingDebt = Math.max(0, remainingDebt - principalPayment)
        }
      } else if (remainingDebt > 0) {
        // After loan term, use savings to pay down any remaining debt
        debtRepaidThisYear = Math.min(remainingDebt, yearlyNetSavings)
        remainingDebt = Math.max(0, remainingDebt - debtRepaidThisYear)
      }

      // Store for tracking
      debtRepaymentArray.push(debtRepaidThisYear)
      remainingDebtArray.push(remainingDebt)

      console.log(`Debug - Year ${year}: Net Savings = ${yearlyNetSavings.toFixed(0)}, Debt Repaid = ${debtRepaidThisYear.toFixed(0)}, Remaining Debt = ${remainingDebt.toFixed(0)}`)
    }

    // Calculate payback based on upfront payment and cumulative savings
    let cumulativeSavings = 0
    let paybackPeriod = solarPanelLifespan // Default to max lifespan
    let paybackYear = -1
    let cumulativeSavingsArray = []

    // For payback calculation, we need to consider:
    // 1. The upfront payment that needs to be recovered
    // 2. The debt that needs to be fully repaid

    for (let year = 0; year < solarPanelLifespan; year++) {
      // Add this year's net savings to cumulative savings
      cumulativeSavings += netYearlySavingsArray[year]
      cumulativeSavingsArray.push(cumulativeSavings)

      // Check if we've reached the payback point:
      // 1. We've recovered the upfront payment through cumulative savings
      // 2. The debt has been fully repaid
      const debtFullyRepaid = remainingDebtArray[year] === 0
      console.log(`Debug - Year ${year}: Cumulative Savings = ${cumulativeSavings.toFixed(0)}, Debt Fully Repaid = ${debtFullyRepaid}`)
      const upfrontPaymentRecovered = cumulativeSavings >= upfrontPayment

      console.log(`Debug - Year ${year}: Cumulative Savings = ${cumulativeSavings.toFixed(0)}, Upfront Payment = ${upfrontPayment.toFixed(0)}, Debt Fully Repaid = ${debtFullyRepaid}`)

      if (upfrontPaymentRecovered && debtFullyRepaid && paybackYear === -1) {
        paybackYear = year
        console.log(`Debug - Payback reached at year ${paybackYear}`)
        break
      }
    }

    // Calculate more accurate payback period
    if (paybackYear === 0) {
      // If payback happens in the first year
      paybackPeriod = upfrontPayment / netYearlySavingsArray[0]
      console.log('Debug - First year payback:', paybackPeriod)
    } else if (paybackYear > 0) {
      // If payback happens after the first year, use interpolation
      const previousYearCumulativeSavings = cumulativeSavingsArray[paybackYear - 1]
      const currentYearSavings = netYearlySavingsArray[paybackYear]

      // Check if debt was fully repaid in the previous year
      const debtRepaidPreviousYear = paybackYear > 0 ? remainingDebtArray[paybackYear - 1] === 0 : false

      if (debtRepaidPreviousYear) {
        // If debt was already repaid, we just need to recover the upfront payment
        paybackPeriod = paybackYear + (upfrontPayment - previousYearCumulativeSavings) / currentYearSavings
      } else {
        // If debt was repaid in this year, we need to account for that
        // This is a simplification - in reality we'd need to calculate the exact month
        paybackPeriod = paybackYear + 0.5 // Assume debt was repaid halfway through the year
      }

      console.log('Debug - Interpolated payback calculation:')
      console.log('  - Previous year cumulative:', previousYearCumulativeSavings)
      console.log('  - Current year savings:', currentYearSavings)
      console.log('  - Result:', paybackPeriod)
    } else if (upfrontPayment <= 0 && installmentAmount <= 0) {
      // If there's no upfront payment or loan, payback is immediate
      paybackPeriod = 0
      console.log('Debug - No investment payback needed')
    } else {
      // If no payback within lifespan
      console.log('Debug - No payback within lifespan')
    }

    console.log('Debug - Final Payback Period:', paybackPeriod)

    // Calculate lifetime savings (20 years)
    const lifetimeSavings = totalSavings

    // Calculate net monthly savings (monthly electricity savings - monthly loan payment)
    const netMonthlySavings = monthlyCostSavings - Math.abs(monthlyPayment)

    // Calculate net savings over loan term (electricity savings - total loan payments)
    const savingsDuringLoanTerm = (monthlyCostSavings * totalPayments) - totalPayment

    // Calculate savings after loan term
    const savingsAfterLoanTerm = lifetimeSavings - savingsDuringLoanTerm

    // Calculate ROI more accurately
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
      calculatedMonthlyConsumption,
      monthlyCostSavings,

      // Annual and lifetime values
      annualCostSavings,
      lifetimeSavings,

      // Investment values
      totalInvestment,
      installmentAmount,
      upfrontPayment,
      monthlyPayment: Math.abs(monthlyPayment), // Ensure positive value for display
      totalPayment,
      interestCost,

      // Performance metrics
      netMonthlySavings,
      paybackPeriod,
      savingsDuringLoanTerm,
      savingsAfterLoanTerm,
      roi,

      // Debt tracking
      remainingDebtArray,
      debtRepaymentArray,
      netYearlySavingsArray,
      cumulativeSavingsArray
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
                      value={calculations.upfrontPayment > 0 ? calculations.paybackPeriod.toFixed(2) : "Không bỏ vốn"}
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

              <div className="bg-green-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-green-800">
                  Tiết kiệm sau khi trả hết nợ ({solarPanelLifespan - installmentTerm} năm còn lại)
                </Label>
                <div className="flex items-center mt-1">
                  <Input
                    value={formatNumber(calculations.savingsAfterLoanTerm)}
                    disabled
                    className="bg-white font-bold text-green-600 border-green-200"
                  />
                  <span className="ml-2 font-medium text-green-800">VND</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Sau khi trả hết nợ, bạn sẽ tiết kiệm được khoảng {formatNumber(calculations.savingsAfterLoanTerm / (solarPanelLifespan - installmentTerm))} VND mỗi năm
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
          <Card className="mt-8">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle>Tổng Kết Tiết Kiệm Trong Vòng Đời Hệ Thống ({solarPanelLifespan} năm)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Trong thời gian trả góp ({installmentTerm} năm)</h3>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatNegativeNumber(calculations.savingsDuringLoanTerm)} VND
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
                    {formatNumber(calculations.savingsAfterLoanTerm)} VND
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Trung bình {formatNumber(calculations.savingsAfterLoanTerm / (solarPanelLifespan - installmentTerm))} VND/năm
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">Tổng tiết kiệm ({solarPanelLifespan} năm)</h3>
                  <div className="text-2xl font-bold text-amber-700">
                    {formatNumber(calculations.lifetimeSavings)} VND
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ROI: {calculations.roi.toFixed(2)}% | Thu hồi vốn: {calculations.paybackPeriod.toFixed(2)} năm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


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

