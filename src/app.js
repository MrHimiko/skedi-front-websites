import '../public/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'

import { autoAnimatePlugin } from "@formkit/auto-animate/vue"

import VueTippy from 'vue-tippy'
import VueTheMask from 'vue-the-mask'


/* Directives */
import dropdown from '@directives/dropdown'
import popup from '@directives/popup'
import tooltip from '@directives/tooltip'
import sortable from '@directives/sortable'
import clipboard from '@directives/clipboard'
import print from '@directives/print'

/* Logic */
import LogicTippy from '@logic/tippy'
import LogicScheme from '@logic/scheme'
import LogicShortcuts from '@logic/shortcuts'
import LogicSession from '@logic/session'

/* Stores */
import { UserStore } from '@stores/user';
import { MenuStore } from '@stores/menu';
import { ExtensionStore } from '@stores/extension';
import { ShortcutStore } from '@stores/shortcut';
import { SettingStore } from '@stores/setting';
import { ComponentStore } from '@stores/component';


const app = createApp(App)

export function initializeApp(callback) 
{
    app.use(createPinia())
    app.use(VueTippy)
    app.use(VueTheMask)

    app.directive('dropdown', dropdown)
    app.directive('popup', popup)
    app.directive('tooltip', tooltip)
    app.directive('sortable', sortable)
    app.directive('clipboard', clipboard)
    app.directive('print', print)

    app.use(autoAnimatePlugin, {
        duration: 10,
        easing: 'ease-in-out',
        delay: 0,
    })

    const stores = {
        user: UserStore(),
        menu: MenuStore(),
        extension: ExtensionStore(),
        shortcut: ShortcutStore(),
        setting: SettingStore(),
        component: ComponentStore(),
    };

    new LogicTippy(app, router, stores)
    new LogicShortcuts(app, router, stores)
    new LogicScheme(app, router, stores)
    new LogicSession(app, router, stores).perform((...data) => 
    {
        callback(app, router, stores, ...data);

        router.addRoute({
            path: '/:pathMatch(.*)*',
            name: 'Not Found',
            component: () => import('@pages/404/view.vue'),
        });
    
        app.use(router)
        app.mount('#app')
    });
}

export default app;