import React, { useState } from 'react';
import { Popup } from 'devextreme-react/popup';
import { useAppModalContext } from '../contexts';

interface BaseModalProps {
    title?: string;
    children?: React.ReactNode;
    showCloseButton?: boolean;
    id: string;
}

export interface BaseModalRef {
    open: (data: any) => void;
    close: () => void;
}

export const BaseModal = React.forwardRef<BaseModalRef, BaseModalProps>((props, ref) => {

    const { title, children, showCloseButton = true, id } = props;
    const [visible, setVisible] = useState(false);
    const modalContext = useAppModalContext();

    React.useImperativeHandle(ref, () => ({
        open: ( data: any) => {
            modalContext?.setModalData({ key: id, data });
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
                    {visible && children}
                </div>
            </Popup>
        </React.Fragment>
    );
});

