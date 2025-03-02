export function settingCompany(stores)
{
    stores.setting.add('account:organization', 'Company', 'Company', 'Change your company name, logo, address, login URL, and account owner.', 'apartment', {
        type: 'PUT',
        endpoint: 'account/organization',
        tabs: [
            {
                title: 'Tab 1',
                components: [
                    {
                        type: 'Input',
                        name: 'name',
                        label: 'Name',
                        width: 12,
                        properties: {
                            placeholder: 'Skedi'
                        }
                    },
                    {
                        type: 'Textarea',
                        name: 'description',
                        label: 'Description',
                        width: 12,
                        properties: {
                            placeholder: 'Short description about your compny.'
                        }
                    },
                    // {
                    //     type: 'Input',
                    //     name: 'email',
                    //     label: 'Email',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'office@Skedi.com'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'phone',
                    //     label: 'Phone',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: '+42 xxx xx xxxx'
                    //     }
                    // },
                    // {
                    //     type: 'Separator',
                    //     width: 12,
                    //     properties: {
                    //         title: 'Address'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'street-1',
                    //     label: 'Street 1',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'Street 1'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'street-2',
                    //     label: 'Street 2',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'Street 2'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'city',
                    //     label: 'City',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'Montreal'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'state',
                    //     label: 'State',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'Quebec'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'country',
                    //     label: 'Country',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: 'Canada'
                    //     }
                    // },
                    // {
                    //     type: 'Input',
                    //     name: 'zip-code',
                    //     label: 'Zip Code',
                    //     width: 6,
                    //     properties: {
                    //         placeholder: '33139'
                    //     }
                    // },
                    {
                        type: 'Separator',
                        width: 12,
                        properties: {
                            title: 'Brand'
                        }
                    },
                    {
                        type: 'Input',
                        name: 'website',
                        label: 'Website',
                        width: 6,
                        properties: {
                            placeholder: 'https://www.Skedi.com'
                        }
                    },
                    {
                        type: 'Color',
                        name: 'color',
                        label: 'Color',
                        width: 6,
                        properties: {
                            placeholder: '#6c5ce7'
                        }
                    }
                ]
            }
        ],
        // values: () => 
        // {
        //     // return stores.organization().getData();
        // },
        // callback: (event, data, response, success) => 
        // {
        //     // if(success)
        //     // {
        //     //     UserStore().organization().setData(response.data)

        //     //     const color = response.data.color;

        //     //     document.documentElement.style.setProperty('--brand-default', color);
        //     //     document.documentElement.style.setProperty('--brand-hover', color.replace(', 1)', ', 0.85)'));
        //     //     document.documentElement.style.setProperty('--brand-active', color.replace(', 1)', ', 0.7)'));
        //     //     document.documentElement.style.setProperty('--brand-stroke', color.replace(', 1)', ', 0.4)'));
        //     //     document.documentElement.style.setProperty('--brand-fill', color.replace(', 1)', ', 0.2)'));
        //     // }
        // }
    });
}