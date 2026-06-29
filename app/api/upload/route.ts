import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'File tidak ditemukan'
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: 'Gagal upload file'
    }, { status: 500 })
  }
}
