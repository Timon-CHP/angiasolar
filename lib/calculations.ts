import { irr } from 'node-irr'

// Define electricity pricing tiers
export const bacDienSinhHoat = [
  { tu: 0, den: 50, gia: 1893 },
  { tu: 50, den: 100, gia: 1956 },
  { tu: 100, den: 200, gia: 2271 },
  { tu: 200, den: 300, gia: 2860 },
  { tu: 300, den: 400, gia: 3197 },
  { tu: 400, den: Number.POSITIVE_INFINITY, gia: 3302 },
]

export const giaKinhDoanh = 2500 // Average commercial electricity price

// Electricity calculation functions
export function tinhTienDienSinhHoat(x: number, bacDien: { tu: number; den: number; gia: number }[]): number {
  let tongTien = 0
  for (let i = 0; i < bacDien.length; i++) {
    const suDung = Math.max(0, Math.min(x - bacDien[i].tu, bacDien[i].den - bacDien[i].tu))
    if (suDung > 0) {
      tongTien += suDung * bacDien[i].gia
    }
  }
  return tongTien
}

export function tinhTienDienKinhDoanh(x: number, giaKinhDoanh: number): number {
  return x * giaKinhDoanh
}

export function tinhSanLuongDien(capacity: number, sunHours: number, efficiency: number, years: number = 0): number {
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

export function tinhSanLuongTieuThu(sanLuongSanXuat: number, tyLeTieuThu: number): number {
  return sanLuongSanXuat * (tyLeTieuThu / 100)
}

export function tinhSanLuongTietKiem(soDienThucTe: number, sanLuongTieuThu: number): number {
  return Math.min(soDienThucTe, sanLuongTieuThu)
}

// Thêm hàm tính số điện từ tiền điện
export function tinhSoDienTuTienDien(tienDien: number, electricityType: string, bacDien: { tu: number; den: number; gia: number }[], giaKinhDoanh: number): number {
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
      const khoangBac = bac.den - (bac.tu+1);
      const tienToiDaBac = khoangBac * bac.gia;
      
      if (tienConLai <= tienToiDaBac) {
        // Nếu số tiền còn lại nhỏ hơn hoặc bằng tiền tối đa của bậc này
        soDien += Math.ceil(tienConLai / bac.gia);
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

// Add IRR calculation function
export function calculateIRR(cashFlows: number[]): number {
  try {
    // The irr library expects the first value to be the initial investment (negative)
    // and subsequent values to be the cash inflows (positive)
    const result = irr(cashFlows);
    return result * 100; // Convert to percentage
  } catch (error) {
    console.error('Error calculating IRR:', error);
    return NaN;
  }
}

// Add PMT function for bank loan calculations
export function calculatePMT(rate: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
  // rate: interest rate per period
  // nper: total number of payment periods
  // pv: present value (loan amount)
  // fv: future value (default 0)
  // type: when payments are due (0: end of period, 1: beginning of period)
  
  if (rate === 0) return -(pv + fv) / nper;
  
  const pvif = Math.pow(1 + rate, nper);
  let pmt = rate / (pvif - 1) * -(pv * pvif + fv);
  
  if (type === 1) {
    pmt = pmt / (1 + rate);
  }
  
  return pmt;
}

// Format number with commas
export function formatNumber(num: number): string {
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Format negative numbers with parentheses
export function formatNegativeNumber(num: number): string {
  if (num < 0) {
    return `(${formatNumber(Math.abs(num))})`
  }
  return formatNumber(num)
}