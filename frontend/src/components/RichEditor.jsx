import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

/**
 * RichEditor
 * - value: HTML string
 * - onChange: (html) => void
 */
export default function RichEditor({ value, onChange, height = 360 }) {
  const ref = useRef(null)

  return (
   <Editor
  apiKey="0ltw0jv0n426jez22h7wxfr6hmjmctyw6v0xxadpzhrdcish"   // 👈 paste it here
  value={value}
  init={{
    height,
    menubar: false,
    plugins: 'link lists code',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link | code',
    branding: false,
    statusbar: false,
    content_style: 'body { font-family: Inter, Roboto, Arial, sans-serif; font-size: 14px }'
  }}
  onEditorChange={(content) => onChange(content)}
/>
  )
}
