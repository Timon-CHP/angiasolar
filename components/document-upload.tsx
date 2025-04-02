"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

export default function DocumentUpload({ onFilesChange }) {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    )
    
    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    
    // Notify parent component about file changes
    if (onFilesChange) {
      onFilesChange(updatedFiles)
    }
  }, [files, onFilesChange])

  const removeFile = (index) => {
    const updatedFiles = [...files]
    
    // Revoke object URL to avoid memory leaks
    if (updatedFiles[index].preview) {
      URL.revokeObjectURL(updatedFiles[index].preview)
    }
    
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)
    
    // Notify parent component about file changes
    if (onFilesChange) {
      onFilesChange(updatedFiles)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    }
  })

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadIcon className="h-10 w-10 text-gray-400" />
          <p className="text-lg font-medium">Kéo thả hoặc nhấp để tải lên tài liệu</p>
          <p className="text-sm text-gray-500">Hỗ trợ PDF, JPG, PNG (tối đa 10MB)</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Tài liệu đã tải lên ({files.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <Card key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-6 w-6 text-blue-500" />
                  <div className="truncate">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

