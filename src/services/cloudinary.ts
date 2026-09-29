const CLOUDINARY_CLOUD_NAME: string =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) ?? 'ddnolovmg'

const CLOUDINARY_UPLOAD_PRESET: string =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) ?? 'rony_hair_uploads'

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  asset_id: string
  format: string
  width: number
  height: number
  bytes: number
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(data?.error?.message ?? 'Échec de l’envoi de l’image. Réessayez.')
  }

  return (await response.json()) as CloudinaryUploadResult
}
