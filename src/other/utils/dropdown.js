import { h, render } from 'vue';
import { tippy } from 'vue-tippy';
import { common } from '@utils/common';

import app from '@/app';

export const dropdown = 
{
    instances: {},
    order: [],

    open(id, element, component, properties = {}, options = {}) 
    {
        if (!id) 
        {
            id = common.uuid();
        }

        if (!element) 
        {
            element = document.querySelector('.c-tippy');
        }

        if (this.instances[id]) 
        {
            this.close(id);
        }

        const container = document.querySelector('.c-tippy') || document.body;
        const mountPoint = document.createElement('div');

        mountPoint.setAttribute('id', `dropdown-${id}`);
        mountPoint.setAttribute('class', `i-tippy-dropdown`);
        mountPoint.setAttribute('data-id', id);

        mountPoint.style.minWidth = `${element.offsetWidth}px`;

        container.appendChild(mountPoint);

        const vnode = h(component, { ...(typeof properties === 'function' ? properties() : properties) });
        vnode.appContext = app._context;

        render(vnode, mountPoint);

        const instance = tippy(element, 
        {
            class: 'dropdown',
            content: mountPoint,
            allowHTML: true,
            interactive: true,
            trigger: 'manual',
            duration: 50,
            delay: 0,
            placement: 'bottom-start',
            appendTo: container,
            hideOnClick: true,
            onCreate(instance) 
            {
                instance.popper.classList.add('dropdown');
            },
            onShow: () => 
            {
                mountPoint.style.minWidth = `${element.offsetWidth}px`;
            },
            onHidden: (instance) => 
            {
                setTimeout(() => this.close(id), 50);
            },
            ...options
        });

        this.order.push(id);
        this.instances[id] = { id, instance, mountPoint, vnode, close: () => this.close(id) };

        instance.show();

        return this.instances[id];
    },

    close(id = null) 
    {
        if (!id) 
        {
            if (this.order.length) 
            {
                id = this.order[this.order.length - 1];
            } 
        }

        if (this.instances[id]) 
        {
            const { instance, mountPoint } = this.instances[id];

            if (instance) 
            {
                instance.hide();
                instance.destroy();
            }

            if (mountPoint) 
            {
                render(null, mountPoint);
                mountPoint.remove();
            }

            delete this.instances[id];
            this.order = this.order.filter((item) => item !== id);
        }
    }
};
