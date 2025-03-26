import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin, Clock } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-amber-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Image src="/logo.svg" alt="AnGia Solar Logo" width={150} height={50} className="bg-white p-2 rounded" />
            </div>
            <p className="text-amber-100 mb-4">
              AnGia Solar cung cấp giải pháp điện mặt trời toàn diện cho hộ gia đình và doanh nghiệp với chi phí tối ưu
              và hiệu quả cao nhất.
            </p>
            <div className="bg-yellow-300 text-amber-800 py-2 px-3 rounded font-bold italic mb-4 inline-block transform -rotate-1">
              "Xài điện thả ga, không lo về giá"
            </div>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="text-white hover:text-yellow-300 transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="https://instagram.com" className="text-white hover:text-yellow-300 transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://youtube.com" className="text-white hover:text-yellow-300 transition-colors">
                <Youtube size={20} />
              </Link>
              <Link href="https://twitter.com" className="text-white hover:text-yellow-300 transition-colors">
                <Twitter size={20} />
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-amber-700 pb-2">Thông Tin Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-yellow-300 flex-shrink-0" />
                <span>123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-yellow-300 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-yellow-300 flex-shrink-0" />
                <span>info@angiasolar.vn</span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-2 text-yellow-300 flex-shrink-0" />
                <span>Thứ 2 - Thứ 6: 8:00 - 17:30</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-amber-700 pb-2">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-yellow-300 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-yellow-300 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-yellow-300 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/dich-vu" className="hover:text-yellow-300 transition-colors">
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/du-an" className="hover:text-yellow-300 transition-colors">
                  Dự án
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-yellow-300 transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/ho-so" className="hover:text-yellow-300 transition-colors">
                  Nộp hồ sơ
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-yellow-300 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-amber-700 pb-2">Thông Tin Pháp Lý</h3>
            <ul className="space-y-3 text-amber-100">
              <li>
                <strong className="text-white">Công ty TNHH AnGia Solar</strong>
              </li>
              <li>
                <span>Mã số doanh nghiệp: 0123456789</span>
              </li>
              <li>
                <span>Ngày cấp: 01/01/2020</span>
              </li>
              <li>
                <span>Nơi cấp: Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</span>
              </li>
              <li>
                <span>Người đại diện pháp luật: Nguyễn Văn A</span>
              </li>
              <li>
                <span>Chức vụ: Tổng Giám đốc</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t border-amber-700 pt-6 pb-4">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <Image
                src="/placeholder.svg?height=60&width=80"
                alt="Chứng nhận ISO"
                width={80}
                height={60}
                className="mx-auto mb-2 bg-white p-1 rounded"
              />
              <span className="text-xs text-amber-200">ISO 9001:2015</span>
            </div>
            <div className="text-center">
              <Image
                src="/placeholder.svg?height=60&width=80"
                alt="Chứng nhận EVN"
                width={80}
                height={60}
                className="mx-auto mb-2 bg-white p-1 rounded"
              />
              <span className="text-xs text-amber-200">Đối tác EVN</span>
            </div>
            <div className="text-center">
              <Image
                src="/placeholder.svg?height=60&width=80"
                alt="Chứng nhận Bộ Công Thương"
                width={80}
                height={60}
                className="mx-auto mb-2 bg-white p-1 rounded"
              />
              <span className="text-xs text-amber-200">Bộ Công Thương</span>
            </div>
            <div className="text-center">
              <Image
                src="/placeholder.svg?height=60&width=80"
                alt="Chứng nhận Chất lượng"
                width={80}
                height={60}
                className="mx-auto mb-2 bg-white p-1 rounded"
              />
              <span className="text-xs text-amber-200">Top 10 Thương hiệu</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-amber-700 pt-6 text-center text-amber-200 text-sm">
          <p>© {currentYear} AnGia Solar. Tất cả các quyền được bảo lưu.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/dieu-khoan-su-dung" className="hover:text-yellow-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-yellow-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/sitemap" className="hover:text-yellow-300 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

