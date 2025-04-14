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

// Update the commercial electricity pricing
export const giaKinhDoanh = [
  { type: "kinh-doanh-duoi-6kv", gia: 3549 },
  { type: "kinh-doanh-6kv-22kv", gia: 3465 },
  { type: "kinh-doanh-tren-22kv", gia: 3265 },
]

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
// Update the commercial electricity calculation function
export function tinhTienDienKinhDoanh(x: number, giaKinhDoanh: any[], type: string = "kinh-doanh-duoi-6kv"): number {
  const pricing = giaKinhDoanh.find(item => item.type === type) || giaKinhDoanh[0];
  return x * pricing.gia;
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

export function tinhSanLuongTieuThu(sanLuongSanXuat: number, tyLeTieuThu: number = 100): number {
  return sanLuongSanXuat * (tyLeTieuThu / 100)
}

export function tinhSanLuongTietKiem(soDienThucTe: number, sanLuongTieuThu: number): number {
  return Math.min(soDienThucTe, sanLuongTieuThu)
}

  // System information state
export function calculateSystemCapacity(monthlyConsumption: number, dayTimePercent: number, production: number, safetyRatio: number): number {
    const yearlyConsumption = monthlyConsumption * 12;
    // Calculate electricity used during daylight hours (kWh/year)
    const dayTimeConsumption = yearlyConsumption * (dayTimePercent / 100);
    
    // Calculate required system capacity (kWp)
    // Formula: Yearly daytime consumption / location's yearly production per kWp * safety ratio
    const requiredCapacity = (dayTimeConsumption / production) * (safetyRatio / 100);
    
    // Round to 1 decimal place for better display
    return Math.round(requiredCapacity * 10) / 10;
};

export const VAT = 0.08 // 8% VAT on electricity and investment

// Thêm hàm tính số điện từ tiền điện
export function tinhSoDienTuTienDien(tienDien: number, electricityType: string, bacDien: { tu: number; den: number; gia: number }[]): number {
  if (isNaN(tienDien) || tienDien <= 0) return 0;
  
  if (electricityType.startsWith("kinh-doanh")) {
    // Đối với điện kinh doanh, tìm giá phù hợp từ constant giaKinhDoanh
    const pricing = giaKinhDoanh.find(item => item.type === electricityType) || giaKinhDoanh[0];
    return Math.round(tienDien / pricing.gia);
  } else {
    // Đối với điện sinh hoạt, cần tính ngược từ các bậc thang
    let soDien = 1;
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



// Add these types and data at the top of the file, after the imports
export type ProvinceData = {
  name: string;
  production: number;
  sunHours: number;
}

export const provincesSolarData: ProvinceData[] = [
  { name: "An Giang", production: 1408, sunHours: 3.86 },
  { name: "Bà Rịa - Vũng Tàu", production: 1458, sunHours: 3.99 },
  { name: "Bạc Liêu", production: 1342, sunHours: 3.68 },
  { name: "Bắc Giang", production: 1048, sunHours: 2.87 },
  { name: "Bắc Kạn", production: 998, sunHours: 2.73 },
  { name: "Bắc Ninh", production: 1053, sunHours: 2.88 },
  { name: "Bến Tre", production: 1386, sunHours: 3.80 },
  { name: "Bình Định", production: 1385, sunHours: 3.79 },
  { name: "Bình Dương", production: 1406, sunHours: 3.85 },
  { name: "Bình Phước", production: 1431, sunHours: 3.92 },
  { name: "Bình Thuận", production: 1530, sunHours: 4.19 },
  { name: "Cà Mau", production: 1323, sunHours: 3.62 },
  { name: "Cao Bằng", production: 1035, sunHours: 2.84 },
  { name: "Cần Thơ", production: 1354, sunHours: 3.71 },
  { name: "Đà Nẵng", production: 1347, sunHours: 3.69 },
  { name: "Đắk Lắk", production: 1380, sunHours: 3.78 },
  { name: "Đắk Nông", production: 1275, sunHours: 3.49 },
  { name: "Điện Biên", production: 1204, sunHours: 3.30 },
  { name: "Đồng Nai", production: 1403, sunHours: 3.84 },
  { name: "Đồng Tháp", production: 1427, sunHours: 3.91 },
  { name: "Gia Lai", production: 1420, sunHours: 3.89 },
  { name: "Hà Giang", production: 967, sunHours: 2.65 },
  { name: "Hà Nam", production: 1060, sunHours: 2.90 },
  { name: "Hà Nội", production: 1031, sunHours: 2.82 },
  { name: "Hà Tĩnh", production: 1093, sunHours: 2.99 },
  { name: "Hải Dương", production: 1046, sunHours: 2.87 },
  { name: "Hải Phòng", production: 1063, sunHours: 2.91 },
  { name: "Hậu Giang", production: 1335, sunHours: 3.66 },
  { name: "Hòa Bình", production: 1030, sunHours: 2.82 },
  { name: "Hưng Yên", production: 1051, sunHours: 2.88 },
  { name: "Khánh Hòa", production: 1409, sunHours: 3.86 },
  { name: "Kiên Giang", production: 1358, sunHours: 3.72 },
  { name: "Kon Tum", production: 1445, sunHours: 3.96 },
  { name: "Lai Châu", production: 1135, sunHours: 3.11 },
  { name: "Lâm Đồng", production: 1451, sunHours: 3.98 },
  { name: "Lạng Sơn", production: 964, sunHours: 2.64 },
  { name: "Lào Cai", production: 1019, sunHours: 2.79 },
  { name: "Long An", production: 1423, sunHours: 3.90 },
  { name: "Nam Định", production: 1079, sunHours: 2.96 },
  { name: "Nghệ An", production: 1080, sunHours: 2.96 },
  { name: "Ninh Bình", production: 1071, sunHours: 2.93 },
  { name: "Ninh Thuận", production: 1536, sunHours: 4.21 },
  { name: "Phú Thọ", production: 1028, sunHours: 2.82 },
  { name: "Phú Yên", production: 1330, sunHours: 3.64 },
  { name: "Quảng Bình", production: 1080, sunHours: 2.96 },
  { name: "Quảng Nam", production: 1262, sunHours: 3.46 },
  { name: "Quảng Ngãi", production: 1256, sunHours: 3.44 },
  { name: "Quảng Ninh", production: 973, sunHours: 2.67 },
  { name: "Quảng Trị", production: 1118, sunHours: 3.06 },
  { name: "Sóc Trăng", production: 1340, sunHours: 3.67 },
  { name: "Sơn La", production: 1229, sunHours: 3.37 },
  { name: "Tây Ninh", production: 1459, sunHours: 4.00 },
  { name: "Thái Bình", production: 1065, sunHours: 2.92 },
  { name: "Thái Nguyên", production: 1014, sunHours: 2.78 },
  { name: "Thanh Hóa", production: 1104, sunHours: 3.02 },
  { name: "Thừa Thiên Huế", production: 1226, sunHours: 3.36 },
  { name: "Tiền Giang", production: 1374, sunHours: 3.76 },
  { name: "TP Hồ Chí Minh", production: 1388, sunHours: 3.80 },
  { name: "Trà Vinh", production: 1385, sunHours: 3.79 },
  { name: "Tuyên Quang", production: 981, sunHours: 2.69 },
  { name: "Vĩnh Long", production: 1371, sunHours: 3.76 },
  { name: "Vĩnh Phúc", production: 1034, sunHours: 2.83 },
  { name: "Yên Bái", production: 960, sunHours: 2.63 }
];