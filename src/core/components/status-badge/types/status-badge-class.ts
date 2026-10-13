import { getStatus, type BadgeTone } from "../../../status";
import "../status-badge.scss";

// Tipler tek yerde tanımlı; createStatusCellTemplate ve createStatusFormTemplate buradan import eder
export type StatusMappingItem = { status: string; color: BadgeTone; text: string };
export type StatusTemplateOptions = { statusMapping?: StatusMappingItem[] };

export const getStatusBadgeClass = (tone: BadgeTone) =>
    `status-badge status-badge--${tone}`;

export const createStatusBadgeElement = (
    value?: string | null,
    customMapping?: StatusMappingItem[]
): HTMLSpanElement | null => {
    if (!value) return null;

    let label = value;
    let tone: BadgeTone = "gray";

    // 1. Kullanıcı özel bir mapping gönderdiyse önce orada ara
    const customItem = customMapping?.find(m => m.status === value);

    if (customItem) {
        label = customItem.text;
        tone = customItem.color;
    } else {
        // 2. Custom mapping'de yoksa veya hiç gönderilmediyse global registry'e (status.ts) düş
        const globalItem = getStatus(value);
        if (globalItem) {
            label = globalItem.label;
            tone = globalItem.tone;
        }
    }

    const badge = document.createElement("span");
    badge.className = getStatusBadgeClass(tone);
    badge.textContent = label;
    return badge;
};