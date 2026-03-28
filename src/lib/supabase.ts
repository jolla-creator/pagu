import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadImage(
  file: File,
  bucket: string = 'menu-images'
): Promise<{ url: string; filename: string }> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filename)

  return { url: publicUrl, filename }
}