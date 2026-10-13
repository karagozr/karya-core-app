import { getStatusOptions } from "../status";
import { createStatusBadgeElement, type StatusTemplateOptions } from "../components/status-badge";

// Grid kolonunda kullanım:
// { dataField: "objstate", visible: true, caption: "Statü", cellTemplate: createStatusCellTemplate() }
// statusMapping verilirse sayfaya özel label/renk, verilmezse status.ts registry'si kullanılır.
export const createStatusCellTemplate =
    ({ statusMapping }: StatusTemplateOptions = {}) =>
    (container: HTMLElement, cellInfo: { value?: string | null }) => {
        const badge = createStatusBadgeElement(cellInfo.value, statusMapping);
        if (badge) container.appendChild(badge);
    };

// İsteğe bağlı: filtre / header filter dropdown'unda ham değer yerine etiket görünsün.
// Kolonda kullanım: lookup: createStatusLookup()
export const createStatusLookup = ({
    statusMapping,
    states,
}: StatusTemplateOptions & { states?: string[] } = {}) => ({
    dataSource: statusMapping
        ? statusMapping.map((m) => ({ value: m.status, label: m.text }))
        : getStatusOptions(states),
    valueExpr: "value",
    displayExpr: "label",
});