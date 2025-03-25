import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({

    base: '/front/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@form': path.resolve(__dirname, './src/components/form'),
            '@global': path.resolve(__dirname, './src/components/global'),
            '@floated': path.resolve(__dirname, './src/components/floated'),

            '@panels': path.resolve(__dirname, './src/panels'),
            '@plugins': path.resolve(__dirname, './src/applications'),

            '@utils': path.resolve(__dirname, './src/other/utils'),
            '@pages': path.resolve(__dirname, './src/other/pages'),
            '@layouts': path.resolve(__dirname, './src/other/layouts'),
            '@directives': path.resolve(__dirname, './src/other/directives'),
            '@logic': path.resolve(__dirname, './src/other/logic'),
            '@stores': path.resolve(__dirname, './src/other/stores'),

            '@user_shared': path.resolve(__dirname, './src/panels/user/plugins/_shared'),
            '@user_events': path.resolve(__dirname, './src/panels/user/plugins/events'),
            '@user_activity': path.resolve(__dirname, './src/panels/user/plugins/activity'),
            '@user_account': path.resolve(__dirname, './src/panels/user/plugins/account'),
            '@user_dashboard': path.resolve(__dirname, './src/panels/user/plugins/dashboard'),
            '@user_teams': path.resolve(__dirname, './src/panels/user/plugins/teams'),

            '@user_builder': path.resolve(__dirname, './src/panels/user/extensions/builder'),


            '@front_events': path.resolve(__dirname, './src/panels/front/plugins/events'),
            

            '@activity': path.resolve(__dirname, './src/plugins/activity'),
            '@account': path.resolve(__dirname, './src/plugins/account'),
            '@settings': path.resolve(__dirname, './src/plugins/settings'),
            '@billing': path.resolve(__dirname, './src/plugins/billing'),

            '@users': path.resolve(__dirname, './src/plugins/users'),
            '@dashboard': path.resolve(__dirname, './src/plugins/dashboard'),
            '@extensions': path.resolve(__dirname, './src/plugins/extensions'),
            '@notifications': path.resolve(__dirname, './src/plugins/notifications'),
            '@search': path.resolve(__dirname, './src/plugins/search')
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
        allowedHosts: ['app.skedi.com', 'front.skedi.com']
    },
    preview: {
        port: 5173,
    }
})
