import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(request: NextRequest) {
  try {
    console.log('Starting document submission process')
    
    // Check if Telegram credentials are configured
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured')
      return NextResponse.json(
        { error: 'Telegram credentials not configured' },
        { status: 500 }
      )
    }

    // Parse the incoming form data
    const formData = await request.formData()
    
    // Extract contact information
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    
    console.log(`Received submission from: ${fullName}, ${phone}`)
    
    // Prepare message for Telegram
    let message = `📝 *Đăng ký mới từ website*\n\n`
    message += `👤 *Họ tên:* ${fullName}\n`
    message += `📱 *Số điện thoại:* ${phone}\n`
    
    if (email) {
      message += `📧 *Email:* ${email}\n`
    }
    
    if (address) {
      message += `🏠 *Địa chỉ:* ${address}\n`
    }
    
    try {
      // Send text message to Telegram
      console.log('Sending message to Telegram')
      const messageResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      })
      
      if (!messageResponse.ok) {
        const errorData = await messageResponse.json()
        console.error('Telegram message API error:', errorData)
      } else {
        console.log('Message sent successfully')
      }
    } catch (messageError) {
      console.error('Error sending message to Telegram:', messageError)
      // Continue execution to try sending files
    }
    
    // Process and send files
    const fileKeys = Array.from(formData.keys()).filter(key => key.startsWith('file-'))
    console.log(`Found ${fileKeys.length} files to process`)
    
    for (const key of fileKeys) {
      const file = formData.get(key) as File
      
      if (file) {
        console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`)
        
        try {
          // Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Create form data for file upload
          const fileFormData = new FormData()
          fileFormData.append('chat_id', TELEGRAM_CHAT_ID)
          
          // Create a file blob
          const fileBlob = new Blob([buffer], { type: file.type })
          fileFormData.append('document', fileBlob, file.name)
          
          console.log(`Sending file ${file.name} to Telegram`)
          
          // Send file to Telegram
          const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: fileFormData,
          })
          
          if (!fileResponse.ok) {
            const errorData = await fileResponse.json()
            console.error(`Error sending file ${file.name}:`, errorData)
          } else {
            console.log(`File ${file.name} sent successfully`)
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError)
          // Continue with other files
        }
      }
    }
    
    console.log('Document submission completed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}