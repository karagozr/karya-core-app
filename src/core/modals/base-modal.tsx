import React, { useState } from 'react';
import { Popup } from 'devextreme-react/popup';
import { AppModalProvider } from '../contexts';

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

    const [visible, setVisible] = useState(false);
    const modalDataRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
        open: (e: any) => {
            modalDataRef.current = e;
            setVisible(true);
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
                    {visible && (
                        <AppModalProvider initialData={modalDataRef.current}>
                            {children}
                        </AppModalProvider>
                    )}
                </div>
            </Popup>
        </React.Fragment>
    );
});

