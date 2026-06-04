import React, { use, useState } from 'react';
import { Popup } from 'devextreme-react/popup';
import { AppModalContext, useAppModalContext } from '../contexts';

interface BaseModalProps {
    title?: string;
    children?: React.ReactNode;
    showCloseButton?: boolean;
}

export interface BaseModalRef {
    open: (e: any) => void;
    close: () => void;
}

export const BaseModal = React.forwardRef<BaseModalRef, BaseModalProps>((props, ref) => {

    const { title, children, showCloseButton = true } = props;
    const modalContext = useAppModalContext() || {};


    const [visible, setVisible] = useState(false);

    React.useImperativeHandle(ref, () => ({
        open: (e: any) => {
            setVisible(true);
            modalContext.setModalData(e);
        },
        close: () => setVisible(false)
    }));

    return (
        <React.Fragment>
           
                <Popup
                    visible={visible}
                    onHiding={() => { setVisible(false); }}
                    title={title}
                    resizeEnabled={true}
                    showCloseButton={showCloseButton}
                    dragEnabled={true} >
                    <div className="modal-content">
                         <AppModalContext.Provider value={modalContext}>
                            {children}
                         </AppModalContext.Provider>
                        
                    </div>
                </Popup>
        </React.Fragment>
    );
});

