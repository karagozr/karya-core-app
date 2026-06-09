import { BaseFormPage } from './form-page';
import type { IBaseFormPageProps } from './types';

const userProfileMeta: IBaseFormPageProps = {
	caption: 'User Profile',
	breadcrumb: { path: '/tasks/form' },
	detailCaption: 'Profile Details',
	formOptions: {
        formAllowOptions: {
            allowSave: false,
            allowNew: false,
            allowDelete: false,
            allowEdit: false
        },
		id: 'user-profile-form',
		operationUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/users',
		colCount: 8,
		items: [
			{
				itemType: 'group',
				caption: 'Personal Info',
				colSpan: 4,
				colCount: 4,
				items: [
					{ dataField: 'id', colSpan: 2, editorOptions: { readOnly: true } },
					{
						dataField: 'firstName',
						colSpan: 2,
						isRequired: true,
						validationRules: [{ type: 'required', message: 'First name is required' }]
					},
					{
						dataField: 'lastName',
						colSpan: 2,
						isRequired: true,
						validationRules: [{ type: 'required', message: 'Last name is required' }]
					},
					{
						dataField: 'birthDate',
						colSpan: 2,
						editorType: 'dxDateBox',
						editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy' }
					}
				]
			},
			{
				itemType: 'group',
				caption: 'Contact',
				colSpan: 4,
				colCount: 4,
				items: [
					{
						dataField: 'email',
						colSpan: 2,
						isRequired: true,
						validationRules: [
							{ type: 'required', message: 'Email is required' },
							{ type: 'email', message: 'Enter a valid email address' }
						]
					},
					{
						dataField: 'phone',
						colSpan: 2,
						editorOptions: { mask: '+90 (000) 000 00 00', maskRules: { X: /[02-9]/ } }
					},
					{
						dataField: 'department',
						colSpan: 2,
						editorType: 'dxSelectBox',
						editorOptions: { items: ['IT', 'Operations', 'Finance', 'Sales'] }
					},
					{
						dataField: 'title',
						colSpan: 2,
						editorType: 'dxTextBox'
					}
				]
			},
			{
				itemType: 'group',
				caption: 'Preferences',
				colSpan: 8,
				colCount: 8,
				items: [
					{
						dataField: 'language',
						colSpan: 2,
						editorType: 'dxSelectBox',
						editorOptions: { items: ['tr', 'en', 'de'] }
					},
					{
						dataField: 'timeZone',
						colSpan: 3,
						editorType: 'dxSelectBox',
						editorOptions: { items: ['Europe/Istanbul', 'UTC', 'Europe/Berlin'] }
					},
					{
						dataField: 'isActive',
						colSpan: 1,
						editorType: 'dxSwitch'
					},
					{
						dataField: 'bio',
						colSpan: 2,
						editorType: 'dxTextArea',
						editorOptions: { minHeight: 70, maxLength: 250 }
					}
				]
			}
		]
	},
	detailItems: [
		{
			type: 'detail',
			inTab: true,
			title: 'Sessions',
			formDetailOptions: {
				operationUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/user-sessions',
				parentKeyField: 'userId',
				isEditable: true,
				columns: [
					{ dataField: 'id', caption: 'ID', editorOptions: { readOnly: true } },
					{ dataField: 'deviceName', caption: 'Device' },
					{ dataField: 'ipAddress', caption: 'IP Address' },
					{ dataField: 'lastSeenAt', caption: 'Last Seen', dataType: 'date' },
					{ dataField: 'isCurrent', caption: 'Current Session', dataType: 'boolean' }
				]
			}
		},
		{
			type: 'detail',
			inTab: true,
			title: 'Login History',
			formDetailOptions: {
				operationUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/user-login-history',
				parentKeyField: 'userId',
				isEditable: false,
				columns: [
					{ dataField: 'id', caption: 'ID', editorOptions: { readOnly: true } },
					{ dataField: 'loginDate', caption: 'Login Date', dataType: 'date' },
					{ dataField: 'result', caption: 'Result' },
					{ dataField: 'location', caption: 'Location' },
					{ dataField: 'client', caption: 'Client' }
				]
			}
		}
	]
};

export const UserProfilPage = () => <BaseFormPage key='user-profile' {...userProfileMeta} />;
