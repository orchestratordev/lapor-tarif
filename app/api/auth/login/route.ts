import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Email atau password salah!'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: 'Gagal login, coba lagi!'
    }, { status: 500 })
  }
}
