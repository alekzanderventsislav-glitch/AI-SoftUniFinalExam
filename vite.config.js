import { resolve } from 'path';
import { defineConfig } from 'vite';

function injectSupabaseEnv() {
  return {
    name: 'inject-supabase-env',
    transformIndexHtml(html) {
      if (html.includes('supabase-env.js')) return html;
      return html.replace(
        '</head>',
        '  <script src="/supabase-env.js"></script>\n</head>'
      );
    },
  };
}

export default defineConfig({
  plugins: [injectSupabaseEnv()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        hrani: resolve(__dirname, 'hrani.html'),
        trenirovki: resolve(__dirname, 'trenirovki.html'),
        trenirovka: resolve(__dirname, 'trenirovka.html'),
        recepti: resolve(__dirname, 'recepti.html'),
        recept: resolve(__dirname, 'recept.html'),
        profil: resolve(__dirname, 'profil.html'),
        admin: resolve(__dirname, 'admin.html'),
        mfaSetup: resolve(__dirname, 'mfa-setup.html'),
        mfaVerify: resolve(__dirname, 'mfa-verify.html'),
      },
    },
  },
});
