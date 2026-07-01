export const tinymceEditorProps = {
  tinymceScriptSrc: '/tinymce/tinymce.min.js',
  licenseKey: 'gpl',
} as const;

export const tinymceBaseInit = {
  base_url: '/tinymce',
  suffix: '.min',
  promotion: false,
  branding: false,
} as const;
