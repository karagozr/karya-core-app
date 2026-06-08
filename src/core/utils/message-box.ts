import Notify from "devextreme/ui/notify";

export type NotifyStack = (typeof Notify)['arguments'][1];

export interface IMessageBoxOptions {
    type: 'success' | 'info' | 'warning' | 'error';
    title?: string;
    message: string;
    displayTime?: number;
}

export const showMessage = ({title, message, type, displayTime}: IMessageBoxOptions) => {
    
    const position: NotifyStack['position'] =  'bottom right';

    Notify({
      message: title ? `${title}: ${message}` : message,
      type: type ?? 'info',
      displayTime: displayTime ?? 3500,
      animation: {
        show: {
          type: 'fade', duration: 400, from: 0, to: 1,
        },
        hide: { type: 'fade', duration: 40, to: 0 },
      },
        }, {
      position,
      direction: 'up-stack',
        });
  }