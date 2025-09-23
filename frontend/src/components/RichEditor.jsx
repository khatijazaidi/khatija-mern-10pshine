// src/components/RichEditor.jsx
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RichEditor({ value, onChange, height = 520 }) {
  const ref = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

  // ✅ Helper for uploading files to backend
  const uploadFile = async (file) => {
    const token = localStorage.getItem('token') || '';
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { location, filename }
  };

  return (
    <Editor
      apiKey={apiKey}
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
          'emoticons', 'wordcount', 'codesample', 'image' // ✅ image plugin
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough |',
          'forecolor backcolor | alignleft aligncenter alignright alignjustify |',
          'bullist numlist outdent indent | link image table | codesample code fullscreen preview'
        ].join(' '),

        // ✅ Code sample languages
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

        // ✅ Fonts & Sizes
        font_family_formats:
          'Inter=Inter,system-ui,sans-serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,serif; Tahoma=tahoma,geneva,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif',
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

        // ✅ Content CSS
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
        `,

        // ✅ Allow paste images as base64
        paste_data_images: true,

        // ✅ Image uploads
        images_upload_handler: async (blobInfo) => {
          const file = blobInfo.blob();
          const data = await uploadFile(file);
          return data.location; // TinyMCE expects a URL
        },

        // ✅ File picker for docs & images
        file_picker_types: 'file image',
        file_picker_callback: (cb, _val, meta) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');

          if (meta.filetype === 'image') {
            input.setAttribute('accept', 'image/*');
          } else {
            input.setAttribute('accept', '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md');
          }

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            try {
              const data = await uploadFile(file);
              if (meta.filetype === 'image') {
                cb(data.location, { alt: data.filename });
              } else {
                ref.current?.insertContent(
                  `<a href="${data.location}" target="_blank" rel="noopener">${data.filename || 'Download file'}</a>`
                );
              }
            } catch (err) {
              alert('Upload failed: ' + (err.message || 'Unknown error'));
            }
          };

          input.click();
        }
      }}
    />
  );
}
