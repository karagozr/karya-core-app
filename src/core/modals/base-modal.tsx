import React, { useState } from 'react';
import { Popup } from 'devextreme-react/popup';

interface BaseModalProps {
    title?: string;
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
    showCloseButton?: boolean;
}

export interface BaseModalRef {
    open: (e: any) => void;
    close: () => void;
}

export const BaseModal = React.forwardRef<BaseModalRef, BaseModalProps>((props, ref) => {

    const { title, children, width = 500, height = 'auto', showCloseButton = true } = props;

    const [visible, setVisible] = useState(false);

    React.useImperativeHandle(ref, () => ({
        open: (e: any) => {
            console.log('Modal opened with event:', e);
            setVisible(true)},
        close: () => setVisible(false)
    }));

    return (
        <Popup
            visible={visible}
            onHiding={() => {
                setVisible(false);
            }}
            title={title}
            width={width}
            height={height}
            showCloseButton={showCloseButton}
            dragEnabled={true}
        >
            <div className="modal-content">

                test
            </div>
        </Popup>
    );
});

