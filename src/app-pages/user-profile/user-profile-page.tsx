import { BaseFormPage, BaseModal, type AppFormRef, type BaseModalRef } from "../../core"
import React from "react";
import { ImageDisplayField } from "../../core/utils";



export const UserProfilePage = () => {
    const formRef = React.useRef<AppFormRef>(null);
    const modalFormRef = React.useRef<AppFormRef>(null);
    return (
        <>
        <BaseFormPage breadcrumb={{ path: "User > My Profile" }}
            caption="My Profile"
            
            formOptions={{
                operationUrl:"https://localhost:7131/api/AppProfile",
                ref: formRef,
                toolbarItems: [{ location: "before", widget: "dxButton", options: { text: "Change Password" ,
                    icon: "key",
                    onClick: (data:any) => {
                            if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                            }
                        formRef.current?.openModal("change-password-modal");
                } } }],
                formAllowOptions: { allowDelete: false, allowEdit: true, allowNew: false, allowSave: true },
                colCount: 8,
                items: [
                    {   
                        itemType: "group", colSpan: 8, colCount: 8,
                        items: [
                            {  
                                itemType: "group",colSpan: 2, caption: "Profile Picture",
                                items: [
                                    { 
                                        dataField: "profilePictureUrl", 
                                        template: ImageDisplayField,
                                        editorOptions: { 
                                            height: "155px",
                                            width: "155px"
                                        }
                                    }
                                ]
                            },
                            {  
                                itemType: "group",colCount: 2,colSpan: 6, caption: "Personal Information",
                                items: [
                                    { dataField: "firstName", colSpan: 1,label: { text: "First Name" }, editorType: "dxTextBox", editorOptions: { readOnly: true } },
                                    { dataField: "lastName", colSpan: 1,label: { text: "Last Name" }, editorType: "dxTextBox", editorOptions: { readOnly: true } },
                                    { dataField: "username", colSpan: 1, label: { text: "Username" }, editorType: "dxTextBox", editorOptions: { readOnly: true } },
                                    { dataField: "email", colSpan: 1,label: { text: "Email" }, editorType: "dxTextBox", editorOptions: { readOnly: true } },
                                    { dataField: "phoneNumber", colSpan: 1, label: { text: "Phone Number" }, editorType: "dxTextBox" },
                                ] 
                            }   
                        ]
                    },
                    {   
                        itemType: "group", caption: "Address Information",  colSpan: 8, colCount: 8,
                        items: [
                            {
                                itemType: "group", colSpan: 4, colCount: 4,
                                items: [
                                    { dataField: "city", colSpan: 2, label: { text: "City" }, editorType: "dxTextBox" },
                                    { dataField: "state", colSpan: 2,label: { text: "State" }, editorType: "dxTextBox" },
                                    { dataField: "zipCode", colSpan: 2, label: { text: "Zip Code" }, editorType: "dxTextBox" },
                                    { dataField: "country", colSpan: 2, label: { text: "Country" }, editorType: "dxTextBox" },
                                ]
                            },
                            {
                                itemType: "group", colSpan: 4, colCount: 4,
                                items: [
                                   { dataField: "address",  colSpan: 4, label: { text: "Address" }, editorType: "dxTextArea",editorOptions:{
                                    height: 94
                                   } },
                                   
                                ]
                            },
              
                        ]
                    }

                ]
            }}

            detailItems={[
                {
                    type: "form",
                    title: "Change Password",
                    modal: { modalKey: "change-password-modal",minWidth: 400, minHeight: 300 },
                    formOptions:{
                        ref:modalFormRef,
                        datasourceOptions: { disableByKey: true, customFormData: {
                            currentPassword: null,
                            newPassword: null,
                            confirmNewPassword: null
                        } },
                        toolbarItems: [{ location: "before", widget: "dxButton", options: { text: "Change Password", icon: "save", 
                                onClick: (e:any) => {
                                    console.log("Form is Valid",    e.currentForm?.instance().validate().isValid);
                                    console.log("Form Data",        e.currentForm?.instance().option("formData"));
                                    console.log("Form Datasource",  e.datasource);
                                    console.log("Main Form Data",   formRef.current?.getFormData());
                                }
                            }
                        }],               
                        operationUrl: "https://localhost:7142/api/user",
                        colCount: 1,
                        items: [
                            { dataField: "currentPassword", colSpan: 1, label: { text: "Current Password" }, editorType: "dxTextBox", editorOptions: { mode: "password" } ,validationRules: [{ type: "required", message: "Current Password is required" }] },
                            { dataField: "newPassword", colSpan: 1, label: { text: "New Password" }, editorType: "dxTextBox", editorOptions: { mode: "password" }, validationRules: [{ type: "required", message: "New Password is required" }] },
                            { dataField: "confirmNewPassword", colSpan: 1, label: { text: "Confirm New Password" }, editorType: "dxTextBox", editorOptions: { mode: "password" }, validationRules: [{ type: "required", message: "Confirm New Password is required" }] },
                            { colSpan: 1, label: { text: "Confirm New Password" }, itemType: "button", 
                                buttonOptions: { text: "Change Password", type: "success", icon: "save"
                                ,onClick: (e:any) => {
                                    console.log("Form is Valid",    e.currentForm?.instance().validate().isValid);
                                    console.log("Form Data",        e.currentForm?.instance().option("formData"));
                                    console.log("Form Datasource",  e.datasource);
                                    console.log("Main Form Data",   formRef.current?.getFormData());
                                }
                            }},

                        ]

                    }
                }
            ]}
                    


        />
        </>
    );
}
