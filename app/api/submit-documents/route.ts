import { FormData as NodeFormData } from 'formdata-node'
import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'
import { Readable } from 'stream'

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData()
    
    // Extract contact information
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    
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
    
    // Send text message to Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
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
    
    // Process and send files
    const fileKeys = Array.from(formData.keys()).filter(key => key.startsWith('file-'))
    
    for (const key of fileKeys) {
      const file = formData.get(key) as File
      
      if (file) {
        // Create a new form data for the file upload
        const telegramFormData = new NodeFormData()
        telegramFormData.append('chat_id', TELEGRAM_CHAT_ID)
        
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Create a readable stream from the buffer
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)
        
        // Add file to form data
        telegramFormData.append('document', stream, {
          filename: file.name,
          contentType: file.type,
        })
        
        // Send file to Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
          method: 'POST',
          body: telegramFormData as any,
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}