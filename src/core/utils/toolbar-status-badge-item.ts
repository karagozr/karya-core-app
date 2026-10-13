import type dxForm from "devextreme/ui/form";
import { createStatusBadgeElement } from "../components/status-badge";

type OptionChangedListener = (e: { name?: string }) => void;


const listeners = new WeakMap<dxForm, Map<string, OptionChangedListener>>();


const MAX_WAIT_FRAMES = 120;

const readField = (formData: unknown, path: string) =>
    path.split(".").reduce<any>((obj, key) => obj?.[key], formData);

const readValue = (form: dxForm, dataField: string): string | null => {
    const raw = readField(form.option("formData"), dataField);
    return typeof raw === "string" && raw.trim() !== "" ? raw : null;
};


export const createStatusBadgeToolbarElement = (
    formRef: { current: any },
    dataField: string,
): HTMLElement => {
    const container = document.createElement("div");
    container.className = "status-badge-toolbar";

    const paint = (form: dxForm) => {
        const badge = createStatusBadgeElement(readValue(form, dataField));
        container.textContent = "";
        if (badge) container.appendChild(badge);
    };

    const subscribe = (form: dxForm) => {
        const byField = listeners.get(form) ?? new Map<string, OptionChangedListener>();

        const previous = byField.get(dataField);
        if (previous) form.off("optionChanged", previous);

        const onOptionChanged: OptionChangedListener = (e) => {
            if (e.name === "formData") paint(form);
        };
        form.on("optionChanged", onOptionChanged);

        byField.set(dataField, onOptionChanged);
        listeners.set(form, byField);
    };

    let frames = 0;
    const tick = () => {
        const form: dxForm | undefined = formRef.current?.formRef?.current?.instance();

        if (form) {
            paint(form);

            if (container.isConnected) {
                subscribe(form);
                return;
            }
        }

        if (++frames < MAX_WAIT_FRAMES) requestAnimationFrame(tick);
    };
    tick();

    return container;
};