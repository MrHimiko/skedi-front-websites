import { dropdown } from '@utils/dropdown';

export default 
{
    mounted(element, binding) 
    {
        if (!binding.value) 
        {
            return;
        }

        const { id, component, properties, options } = binding.value;

        const openDropdown = () => 
        {
            element._dropdownInstance = dropdown.open(id, element, component, properties, options);
        };

        element.addEventListener('click', openDropdown);
        element._dropdownHandler = openDropdown;
    },

    unmounted(element) 
    {
        if (element._dropdownHandler) 
        {
            element.removeEventListener('click', element._dropdownHandler);
            delete element._dropdownHandler;
        }

        if (element._dropdownInstance) 
        {
            element._dropdownInstance.close();
        }
    }
};
