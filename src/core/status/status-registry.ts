export type BadgeTone =
  | "gray"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "yellow"
  | "teal"
  | "cyan"
  | "pink"
  | "indigo"
  | "lime"
  | "amber"
  | "brown"
  | "slate"
  | "violet"
  | "emerald"
  | "fuchsia"
  | "rose";
export type StatusItem = { label: string; tone: BadgeTone };

// Sıra önemli: states verilmezse filtre dropdown'u bu sırayla listelenir.
// Anahtarlar API'den gelen değerle birebir aynı olmalı.
export const statusRegistry: Record<string, StatusItem> = {
  // Genel statüler
  Planned: { label: "Planlandı", tone: "gray" },
  Released: { label: "Yayınlandı", tone: "blue" },
  Closed: { label: "Kapandı", tone: "green" },
  Cancelled: { label: "İptal Edildi", tone: "red" },

  // Depo tarafında kullanılan statüler
  PartiallyDelivered: { label: "Kısmen Teslim", tone: "orange" },

  // Bütçe tarafında kullanılan statüler
  New: { label: "Yeni", tone: "gray" },
  Populated: { label: "Dolduruldu", tone: "indigo" },
  Approved: { label: "Onaylandı", tone: "green" },
};

const warnedValues = new Set<string>();

const warnUnknown = (value: string) => {
  if (!import.meta.env.DEV || warnedValues.has(value)) return;
  warnedValues.add(value);
  console.warn(
    `[status-registry] "${value}" tanımlı değil; ham metin ve gri badge ile gösteriliyor. status-registry.ts içine ekle.`,
  );
};

export const getStatus = (value?: string | null): StatusItem | null => {
  if (!value) return null;

  const item = statusRegistry[value];
  if (item) return item;

  warnUnknown(value);
  return { label: value, tone: "gray" };
};

export const getStatusOptions = (states?: string[]) =>
  (states ?? Object.keys(statusRegistry)).map((value) => ({
    value,
    label: getStatus(value)?.label ?? value,
  }));
