// src/components/RichEditor.jsx
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Switch, Typography } from '@mui/material';

export default function RichEditor({ value, onChange, height = 520 }) {
  const ref = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

  // Force TinyMCE to re-init when theme changes
  const editorKey = darkMode ? 'tinydark' : 'tinylight';

  const contentStyle = darkMode
    ? `
      body { background:#121212; color:#e0e0e0; font-family: Inter, Arial, sans-serif; font-size:14px; }
      pre code { background:#1e1e1e; color:#e6e6e6; padding:10px; border-radius:6px; display:block; }
    `
    : `
      body { background:#ffffff; color:#111111; font-family: Inter, Arial, sans-serif; font-size:14px; }
      pre code { background:#f4f4f4; color:#111111; padding:10px; border-radius:6px; display:block; }
    `;

  return (
    <Box>
      {/* ✅ Theme toggle switch */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {darkMode ? 'Dark Theme' : 'Light Theme'}
        </Typography>
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      </Box>

      <Editor
        key={editorKey}   // re-init editor when theme changes
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
        onInit={(_, editor) => (ref.current = editor)}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          branding: false,
          skin: darkMode ? 'oxide-dark' : 'oxide',   // TinyMCE UI chrome
          content_css: darkMode ? 'dark' : 'default', // Editor body

          menubar: 'file edit view insert format tools table help',
          plugins:
            'advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table emoticons wordcount codesample',
          toolbar:
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | codesample | code fullscreen preview',

          // ✅ Code snippet support
          codesample_languages: [
            { text: 'HTML/XML', value: 'markup' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'CSS', value: 'css' },
            { text: 'Python', value: 'python' },
            { text: 'Java', value: 'java' },
            { text: 'C', value: 'c' },
            { text: 'C++', value: 'cpp' },
            { text: 'C#', value: 'csharp' },
            { text: 'PHP', value: 'php' },
            { text: 'Ruby', value: 'ruby' },
            { text: 'Go', value: 'go' }
          ],

          font_family_formats:
            'Inter=Inter,system-ui,sans-serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,serif; Tahoma=tahoma,geneva,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif',
          font_size_formats: '10px 12px 14px 16px 18px 20px 24px 28px 32px 36px',

          content_style: contentStyle
        }}
      />
    </Box>
  );
}