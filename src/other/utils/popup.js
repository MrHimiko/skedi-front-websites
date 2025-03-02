import { h, render } from 'vue';
import { tippy } from 'vue-tippy';
import { common } from '@utils/common';

import app from '@/app';

import OverlayComponent from '@floated/overlay/view.vue';

export const popup = 
{
    instances: {},
    order: [],

    open(id, element, component, properties = {}, overlay = {}, options = {}) 
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

        mountPoint.setAttribute('id', `popup-${id}`);
        mountPoint.setAttribute('class', `i-tippy-popup`);
        mountPoint.setAttribute('data-id', id);

        container.appendChild(mountPoint);

        const vnode = h(OverlayComponent, { ...overlay }, {
            content: () => h(component, { ...(typeof properties === 'function' ? properties() : properties) })
        });

        vnode.appContext = app._context; 

        render(vnode, mountPoint);

        const instance = tippy(element, 
        {
            content: mountPoint,
            allowHTML: true,
            interactive: true,
            trigger: 'manual',
            duration: 50,
            delay: 0,
            placement: 'bottom-start',
            hideOnClick: false,
            appendTo: container,
            onCreate(instance) 
            {
                instance.popper.classList.add('popup');
            },
            onShow(instance) 
            {
                instance.popper.style.position = 'fixed';
                instance.popper.style.zIndex = '1000';
                instance.popper.style.top = '50%';
                instance.popper.style.left = '50%';
                instance.popper.style.transform = 'translate(-50%, -50%)';
            },
            onHide(instance) 
            {
                setTimeout(() => popup.close(id), 1);
            },
            ...options
        });

        this.order.push(id);
        this.instances[id] = { id, instance, mountPoint, vnode, close: () => 
        {
            this.close(id);
        }};
    
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
