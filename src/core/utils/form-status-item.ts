import type dxForm from "devextreme/ui/form";
import { createStatusBadgeElement, type StatusTemplateOptions } from "../components/status-badge";

type FormTemplateData = {
    component?: dxForm;
    dataField?: string;
};

type OptionChangedListener = (e: { name?: string }) => void;

const listeners = new WeakMap<dxForm, Map<string, OptionChangedListener>>();

const readField = (formData: unknown, path: string) =>
    path.split(".").reduce<any>((obj, key) => obj?.[key], formData);

// Form item'ında kullanım:
// { dataField: "objstate", label: { text: "Statü" }, colSpan: 2, template: createStatusFormTemplate() }
// (DevExtreme Form'da cellTemplate yok, karşılığı template)
export const createStatusFormTemplate =
    ({ statusMapping }: StatusTemplateOptions = {}) =>
    (data: FormTemplateData) => {
        const host = document.createElement("div");
        host.className = "status-badge-field";

        const form = data.component;
        const dataField = data.dataField;
        if (!form || !dataField) return host;

        const paint = () => {
            const value = readField(form.option("formData"), dataField);
            const badge = createStatusBadgeElement(value, statusMapping);
            host.textContent = "";
            if (badge) host.appendChild(badge);
        };
        paint();

        const byField = listeners.get(form) ?? new Map<string, OptionChangedListener>();
        const previous = byField.get(dataField);
        if (previous) form.off("optionChanged", previous);

        const onOptionChanged: OptionChangedListener = (e) => {
            if (e.name === "formData") paint();
        };
        form.on("optionChanged", onOptionChanged);

        byField.set(dataField, onOptionChanged);
        listeners.set(form, byField);

        return host;
    };