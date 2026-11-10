import { createClient } from '@/lib/supabase/client'
import { requireUser } from '@/lib/counter-sync'

export type CounterEvidence = {
  id: string
  counterId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  url: string
  filePath: string
}

const BUCKET = 'counter-evidence'
const MAX_FILE_SIZE = 10 * 1024 * 1024

function toEvidence(row: { id: string; counter_id: string; file_path: string; file_name: string; mime_type: string; size_bytes: number; created_at: string }, url: string): CounterEvidence {
  return { id: row.id, counterId: row.counter_id, fileName: row.file_name, mimeType: row.mime_type, sizeBytes: row.size_bytes, createdAt: row.created_at, url, filePath: row.file_path }
}

export async function listCounterEvidence(counterId: string) {
  const supabase = createClient()
  await requireUser()
  const { data, error } = await supabase.from('counter_evidence').select('*').eq('counter_id', counterId).order('created_at', { ascending: false })
  if (error) throw error
  const rows = data ?? []
  const signed = await Promise.all(rows.map(async (row) => {
    const { data: signedData, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(row.file_path, 3600)
    if (signedError) throw signedError
    return toEvidence(row, signedData.signedUrl)
  }))
  return signed
}

export async function uploadCounterEvidence(counterId: string, file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Pilih file gambar.')
  if (file.size > MAX_FILE_SIZE) throw new Error('Ukuran gambar maksimal 10 MB.')
  const supabase = createClient()
  const user = await requireUser()
  if (!user) throw new Error('Supabase user unavailable')
  const id = crypto.randomUUID()
  const path = `${user.id}/${counterId}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const { data: row, error: insertError } = await supabase.from('counter_evidence').insert({ owner_id: user.id, counter_id: counterId, file_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size }).select('*').single()
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path])
    throw insertError
  }
  const { data: signedData, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (signedError) throw signedError
  return toEvidence(row, signedData.signedUrl)
}

export async function deleteCounterEvidence(evidence: CounterEvidence) {
  const supabase = createClient()
  await requireUser()
  const { error: rowError } = await supabase.from('counter_evidence').delete().eq('id', evidence.id)
  if (rowError) throw rowError
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([evidence.filePath])
  if (storageError) return
}
