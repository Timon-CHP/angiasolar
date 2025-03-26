"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react"

// Mock API function for file upload
const uploadFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate successful upload (90% of the time)
      if (Math.random() < 0.9) {
        resolve({
          success: true,
          url: `https://api.example.com/files/${file.name}`,
        })
      } else {
        resolve({
          success: false,
          error: "Lỗi khi tải lên tệp. Vui lòng thử lại.",
        })
      }
    }, 1500)
  })
}

type FileStatus = "idle" | "uploading" | "success" | "error"

interface UploadedFile {
  file: File
  status: FileStatus
  progress: number
  url?: string
  error?: string
}

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles: UploadedFile[] = []

    for (const file of selectedFiles) {
      // Check file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setSubmitError(`Tệp "${file.name}" không đúng định dạng. Vui lòng tải lên tệp PDF, JPG, PNG hoặc DOC.`)
        continue
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setSubmitError(`Tệp "${file.name}" vượt quá kích thước tối đa (10MB).`)
        continue
      }

      newFiles.push({
        file,
        status: "idle",
        progress: 0,
      })
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
      setSubmitError(null)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      setSubmitError("Vui lòng tải lên ít nhất một tệp.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    // Update all files to uploading status
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        status: "uploading",
        progress: 0,
      })),
    )

    // Upload each file
    const uploadPromises = files.map(async (fileObj, index) => {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles((prev) => {
          const newFiles = [...prev]
          if (newFiles[index] && newFiles[index].status === "uploading") {
            const currentProgress = newFiles[index].progress
            if (currentProgress < 90) {
              newFiles[index] = {
                ...newFiles[index],
                progress: currentProgress + Math.floor(Math.random() * 10) + 1,
              }
            }
          }
          return newFiles
        })
      }, 300)

      try {
        const result = await uploadFile(fileObj.file)

        clearInterval(progressInterval)

        setFiles((prev) => {
          const newFiles = [...prev]
          if (newFiles[index]) {
            newFiles[index] = {
              ...newFiles[index],
              status: result.success ? "success" : "error",
              progress: result.success ? 100 : newFiles[index].progress,
              url: result.url,
              error: result.error,
            }
          }
          return newFiles
        })

        return result
      } catch (error) {
        clearInterval(progressInterval)

        setFiles((prev) => {
          const newFiles = [...prev]
          if (newFiles[index]) {
            newFiles[index] = {
              ...newFiles[index],
              status: "error",
              error: "Lỗi không xác định khi tải lên tệp.",
            }
          }
          return newFiles
        })

        return { success: false, error: "Lỗi không xác định khi tải lên tệp." }
      }
    })

    const results = await Promise.all(uploadPromises)

    setSubmitting(false)

    // Check if all uploads were successful
    const allSuccess = results.every((result) => result.success)

    if (allSuccess) {
      setSubmitSuccess(true)
    } else {
      setSubmitError("Một số tệp không thể tải lên. Vui lòng kiểm tra và thử lại.")
    }
  }

  const resetForm = () => {
    setFiles([])
    setSubmitSuccess(false)
    setSubmitError(null)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-blue-900 text-white rounded-t-lg">
        <CardTitle>Nộp hồ sơ trực tuyến</CardTitle>
        <CardDescription className="text-blue-100">
          Tải lên các tài liệu cần thiết để đăng ký lắp đặt điện mặt trời
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {submitSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nộp hồ sơ thành công!</h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã nhận được hồ sơ của bạn. Đội ngũ AnGia Solar sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <Button onClick={resetForm}>Nộp hồ sơ khác</Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Hướng dẫn</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Tải lên các tài liệu cần thiết (CMND/CCCD, hóa đơn điện, giấy tờ nhà đất)</li>
                <li>Định dạng được chấp nhận: PDF, JPG, PNG, DOC, DOCX</li>
                <li>Kích thước tối đa: 10MB cho mỗi tệp</li>
                <li>Đảm bảo tài liệu rõ ràng, không bị mờ hoặc cắt xén</li>
              </ul>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="w-12 h-12 text-blue-500 mb-4" />
                <h4 className="text-lg font-medium mb-2">Kéo và thả tệp vào đây</h4>
                <p className="text-gray-500 mb-4">hoặc</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  Chọn tệp từ máy tính
                </Button>
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Tệp đã tải lên ({files.length})</h3>
                <div className="space-y-3">
                  {files.map((fileObj, index) => (
                    <div key={index} className="flex items-center border rounded-lg p-3">
                      <FileText className="w-8 h-8 text-blue-500 mr-3" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="truncate pr-2">
                            <p className="font-medium truncate">{fileObj.file.name}</p>
                            <p className="text-sm text-gray-500">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          {fileObj.status === "idle" && (
                            <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-500">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {fileObj.status === "uploading" && (
                          <div className="mt-2">
                            <Progress value={fileObj.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">Đang tải lên... {fileObj.progress}%</p>
                          </div>
                        )}
                        {fileObj.status === "error" && (
                          <p className="text-sm text-red-500 mt-1">{fileObj.error || "Lỗi tải lên"}</p>
                        )}
                        {fileObj.status === "success" && (
                          <p className="text-sm text-green-500 mt-1 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Tải lên thành công
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      {!submitSuccess && (
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={resetForm} disabled={submitting || files.length === 0}>
            Hủy
          </Button>
          <Button onClick={uploadAllFiles} disabled={submitting || files.length === 0}>
            {submitting ? "Đang xử lý..." : "Nộp hồ sơ"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

