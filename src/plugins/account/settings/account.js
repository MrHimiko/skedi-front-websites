export function settingAccount(stores)
{
    stores.setting.add('account', 'Account', 'Account', 'Update your personal information such as your name.', 'account_circle', {
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
                            placeholder: '312'
                        }
                    }
                ]
            },
            // {
            //     title: 'Contact',
            //     icon: 'phone',
            //     components: [
            //         {
            //             type: 'Repeater',
            //             width: 12,
            //             properties: {
            //                 components: [
            //                     {
            //                         type: 'Input',
            //                         name: 'name',
            //                         label: 'Name',
            //                         required: true,
            //                         width: 12,
            //                         properties: 
            //                         {
            //                             placeholder: '312'
            //                         }
            //                     },
            //                 ]
            //             }
            //         }
            //     ]
            // },
            // {
            //     title: 'Sessions',
            //     icon: 'devices',
            //     components: [
            //         {
            //             label: 'Session',
            //             description: 'View and manage all of your sessions at one place',
            //             component: SessionsComponent,
            //             width: 12,
            //         },
            //         {
            //             type: 'Empty',
            //             width: 9,
            //         }
            //     ]
            // }
        ],
        values: () => 
        {
            return stores.user.getData();
        },
        callback: (event, data, response, success) => 
        {
            if(success)
            {
                stores.user.setData(response.data)
            }
        }
    });
}
