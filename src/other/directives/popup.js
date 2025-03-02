import { popup } from '@utils/popup';

export default 
{
    mounted(element, binding) 
    {
        if (!binding.value) 
        {
            return;
        }

        const { id, component, properties, overlay, options } = binding.value;

        const openPopup = () => 
        {
            element._popupInstance = popup.open(id, element, component, properties, overlay, options);
        };

        element.addEventListener('click', openPopup);
        element._popupHandler = openPopup;
    },

    unmounted(element) 
    {
        if(element._popupHandler) 
        {
            element.removeEventListener('click', element._popupHandler);
            delete element._popupHandler;
        }

        if(element._popupInstance)
        {
            element._popupInstance.close();
        }
    }
};
