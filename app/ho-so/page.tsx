"use client"

import DocumentUpload from "@/components/document-upload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

export default function DocumentSubmissionPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  })
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFilesChange = (uploadedFiles) => {
    setFiles(uploadedFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.fullName || !formData.phone) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng điền họ tên và số điện thoại",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare form data for submission
      const submissionData = new FormData()
      
      // Add contact information
      Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key])
      })
      
      // Add files
      files.forEach((file, index) => {
        submissionData.append(`file-${index}`, file)
      })

      // Send to API endpoint that will forward to Telegram
      const response = await fetch('/api/submit-documents', {
        method: 'POST',
        body: submissionData
      })

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi gửi thông tin')
      }

      toast({
        title: "Gửi thông tin thành công",
        description: "Đội ngũ AnGia Solar sẽ liên hệ với bạn trong thời gian sớm nhất.",
      })

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
      })
      setFiles([])
      
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Gửi thông tin thất bại",
        description: "Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">Nộp hồ sơ đăng ký điện mặt trời</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Để đăng ký lắp đặt hệ thống điện mặt trời, vui lòng điền thông tin liên hệ và tải lên các giấy tờ cần thiết. Đội ngũ AnGia Solar sẽ xem
          xét hồ sơ của bạn và liên hệ trong thời gian sớm nhất.
        </p>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0901234567"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ lắp đặt</Label>
                <Textarea 
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  rows={3}
                />
              </div>
            </Card>
            
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Tài liệu đính kèm</h2>
              <DocumentUpload onFilesChange={handleFilesChange} />
            </Card>
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="px-8 py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi hồ sơ"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

