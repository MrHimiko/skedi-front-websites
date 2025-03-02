export function settingDomain(stores)
{
    stores.setting.add('domain', 'Builder', 'Domain', 'Configure your website domain to display property listings.', 'language', {
        type: 'PUT',
        endpoint: 'account/user',
        tabs: [
            {
                title: 'General',
                icon: 'settings',
                components: [
                    {
                        type: 'Input',
                        name: 'name',
                        label: 'Name',
                        required: true,
                        width: 12,
                        properties: 
                        {
                            placeholder: 'myproperties.com'
                        }
                    },
                    {
                        type: 'Select',
                        name: 'WWW',
                        label: 'Configuration',
                        required: true,
                        width: 12,
                        properties: 
                        {
                            options: [
                                {label: 'Use www and non-www'},
                                {label: 'Use www only'},
                                {label: 'Use non-www only'}
                            ]
                        }
                    }
                ]
            },
        ],
    });
}
