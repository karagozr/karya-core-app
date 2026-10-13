import { getStatus } from "../../status";
import { getStatusBadgeClass } from "./types/status-badge-class";

export const StatusBadge = ({ value }: { value?: string | null }) => {
    const item = getStatus(value);
    if (!item) return null;

    return <span className={getStatusBadgeClass(item.tone)}>{item.label}</span>;
};