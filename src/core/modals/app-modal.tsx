import React from "react";

import { useAppModalContext } from "../contexts";
import { Popup } from "devextreme-react";
import type { IModalProps } from "../pages";

export const AppFormModal = (props: IModalProps)=>{
  const appModalContext = useAppModalContext();
  const { title, modalKey,children,height,width,maxHeight,maxWidth,minHeight,minWidth } = props;
  return (
    <React.Fragment>
        <Popup
            visible={appModalContext?.isActive(modalKey)}
            onHiding={() => { appModalContext?.closeModal(modalKey); }}
            title={title}
            height={height}
            width={width}
            maxHeight={maxHeight}
            maxWidth={maxWidth}
            minHeight={minHeight}
            minWidth={minWidth}
            resizeEnabled={true}
            showCloseButton={true}
            dragEnabled={true} >
            <div className="modal-content">
                {appModalContext?.isActive(modalKey) && children}
            </div>
        </Popup>
    </React.Fragment>
  );
}