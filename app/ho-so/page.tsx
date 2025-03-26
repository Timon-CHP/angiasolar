import DocumentUpload from "@/components/document-upload"

export default function DocumentSubmissionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Nộp hồ sơ đăng ký điện mặt trời</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Để đăng ký lắp đặt hệ thống điện mặt trời, vui lòng tải lên các giấy tờ cần thiết. Đội ngũ AnGia Solar sẽ xem
          xét hồ sơ của bạn và liên hệ trong thời gian sớm nhất.
        </p>

        <DocumentUpload />
      </div>
    </div>
  )
}

