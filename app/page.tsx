import SolarCalculator from "@/components/solar-calculator"
import BenefitsGrid from "@/components/benefits-grid"
import CookieConsent from "@/components/cookie-consent"
import CustomerExperiences from "@/components/customer-experiences"
import Footer from "@/components/footer"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="container mx-auto flex flex-col items-center justify-between">
          <div className="flex items-center">
            <a href="https://angiasolar.com.vn/"><Image src="/ags-icon-128.png" alt="AnGia Solar Logo" width={96} height={96} className="mr-4" /></a>
          </div>
          <nav className="md:hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium">
                Chủ nhà/Doanh nghiệp
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium">
                Đối tác
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium">
                Về AnGia Solar
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-amber-600 font-medium">
                <span className="flex items-center">
                  <Image src="/vi-flag.svg" alt="Vietnamese" width={20} height={14} className="mr-1" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </nav>
          <button className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section - Changed to sun-like colors */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <div className="flex mb-4">
                <button className="bg-amber-700 hover:bg-amber-800 text-white font-medium py-2 px-4 rounded-full">
                  Trả chậm
                </button>
              </div>

              {/* Slogan - Updated colors */}
              <div className="mb-6 bg-yellow-300 text-amber-800 py-3 px-5 rounded-lg inline-block transform -rotate-2 shadow-lg">
                <h2 className="text-2xl md:text-3xl font-bold italic">"Xài điện thả ga, không lo về giá"</h2>
              </div>

              <SolarCalculator />
            </div>

            <div className="w-full md:w-1/2 h-full flex">
              <div className="bg-amber-500 rounded-lg p-6 relative flex-1 flex flex-col">
                <div className="absolute top-4 right-4">
                  <Image src="/qrcode.svg" alt="QR Code" width={100} height={100} />
                </div>
                <h2 className="text-3xl font-bold mb-2">LỢI ÍCH</h2>
                <h3 className="text-xl mb-6">
                  Khi lắp đặt Điện Mặt Trời cùng <span className="text-yellow-200 font-bold">AnGia Solar</span>
                </h3>

                <div className="flex-1">
                  <BenefitsGrid />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Experiences Section */}
      {/* <CustomerExperiences /> */}

      {/* Footer */}
      {/* <Footer /> */}

      <CookieConsent />
    </main>
  )
}

