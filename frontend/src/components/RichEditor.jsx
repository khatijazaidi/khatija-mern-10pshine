// src/components/RichEditor.jsx
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RichEditor({ value, onChange, height = 520 }) {
  const ref = useRef(null);

  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      onInit={(_, editor) => (ref.current = editor)}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height,
        branding: false,
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'charmap',
          'preview', 'anchor', 'searchreplace', 'visualblocks',
          'code', 'fullscreen', 'insertdatetime', 'table',
          'emoticons', 'wordcount'
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough |',
          'forecolor backcolor | alignleft aligncenter alignright alignjustify |',
          'bullist numlist outdent indent | table | code fullscreen preview'
        ].join(' '),

        // ✅ More font choices
        font_family_formats:
          'Inter=Inter,system-ui,sans-serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,serif; Tahoma=tahoma,geneva,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif',

        // ✅ Font sizes
        font_size_formats: '10px 12px 14px 16px 18px 20px 24px 28px 32px 36px',

        // ✅ Colors + Highlighters
        color_map: [
          '#000000', 'Black',
          '#FFFFFF', 'White',
          '#FF0000', 'Red',
          '#00FF00', 'Green',
          '#0000FF', 'Blue',
          '#FFFF00', 'Yellow (Highlighter)',
          '#FFA500', 'Orange',
          '#800080', 'Purple',
          '#808080', 'Gray'
        ],

        // ✅ Style dropdown
        style_formats: [
          { title: 'Highlight', inline: 'span', styles: { backgroundColor: 'yellow' } },
          { title: 'Small Text', inline: 'small' },
          { title: 'Code Block', block: 'pre', classes: 'code-block' }
        ],

        content_style: `
          body { font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; }
          .code-block { background: #f4f4f4; padding: 10px; border-radius: 4px; }
        `
      }}
    />
  );
}
