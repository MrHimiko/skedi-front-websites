import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({

    base: '/front/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@form': path.resolve(__dirname, './src/components/form'),
            '@floated': path.resolve(__dirname, './src/components/floated'),
            '@global': path.resolve(__dirname, './src/components/global'),

            '@panels': path.resolve(__dirname, './src/panels'),
            '@plugins': path.resolve(__dirname, './src/applications'),

            '@utils': path.resolve(__dirname, './src/other/utils'),
            '@pages': path.resolve(__dirname, './src/other/pages'),
            '@layouts': path.resolve(__dirname, './src/other/layouts'),
            '@directives': path.resolve(__dirname, './src/other/directives'),
            '@logic': path.resolve(__dirname, './src/other/logic'),
            '@stores': path.resolve(__dirname, './src/other/stores'),

            '@front_events': path.resolve(__dirname, './src/panels/front/plugins/events'),

            '@notifications': path.resolve(__dirname, './src/plugins/notifications'),
        }
    },
    plugins: [vue()],
    build: {
        outDir: path.resolve(__dirname, './dist'),
        rollupOptions: {
            output: {
                manualChunks: () => 'main.js'
            }
        }
    },
    server: {
        hmr: true,
        host: '0.0.0.0',
        allowedHosts: ['app.skedi.com', 'front.skedi.com']
    },
    preview: {
        port: 5173,
    }
})
