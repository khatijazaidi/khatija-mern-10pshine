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
          'emoticons', 'wordcount', 'codesample' // ✅ NEW
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough |',
          'forecolor backcolor | alignleft aligncenter alignright alignjustify |',
          'bullist numlist outdent indent | table | codesample code fullscreen preview' // ✅ Added codesample
        ].join(' '),

        // ✅ Languages dropdown for code blocks
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'JSON', value: 'json' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'C', value: 'c' },
          { text: 'C++', value: 'cpp' },
          { text: 'C#', value: 'csharp' },
          { text: 'PHP', value: 'php' },
          { text: 'SQL', value: 'sql' },
          { text: 'Shell', value: 'bash' }
        ],

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
          { title: 'Small Text', inline: 'small' }
        ],

        content_style: `
          body { font-family: Inter, Arial, Helvetica, sans-serif; font-size:14px; }
          pre[class*="language-"] { 
            background: #272822; 
            color: #f8f8f2; 
            padding: 10px; 
            border-radius: 4px; 
            font-family: Consolas, Monaco, monospace;
            font-size: 13px;
          }
        `
      }}
    />
  );
}
