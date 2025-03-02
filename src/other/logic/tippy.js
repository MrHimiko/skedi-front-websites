import { popup } from '@utils/popup';
import { dropdown } from '@utils/dropdown';

export default class 
{
    constructor() 
    {   
        document.addEventListener('click', (event) => 
        {
            if(event.target.matches('.i-popup-close')) 
            {
                const popupElement = event.target.closest('.i-tippy-popup');

                if(popupElement) 
                {
                    const popupId = popupElement.getAttribute('data-id');

                    if (popupId) 
                    {
                        popup.close(popupId);
                    }
                }
            }

            else if(event.target.matches('.i-dropdown-close')) 
            {
                const dropdownElement = event.target.closest('.i-tippy-dropdown');

                if(dropdownElement) 
                {
                    const dropdownId = dropdownElement.getAttribute('data-id');

                    if (dropdownId) 
                    {
                        dropdown.close(dropdownId);
                    }
                }
            }
        });
    }
}
