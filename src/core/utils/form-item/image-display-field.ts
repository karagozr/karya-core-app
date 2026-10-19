import type { DxElement } from "devextreme/core/element";

export const ImageDisplayField = (data: any, itemElement: DxElement) => {

    const {editorOptions} = data;

    itemElement.innerHTML = `<div style=" display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;"> 
                                <img src="https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/03.png" 
                                    alt="Profile Picture" style="height: ${editorOptions.height??"155px"}; width: ${editorOptions.width??"155px"}; display: block; margin-left: auto;  
                                    margin-right: auto;  border: 1px solid  #e0e0e0;border-radius: 50%; object-fit: scale-down; object-position: center;" />
                             </div>`;

    return itemElement;
    
}