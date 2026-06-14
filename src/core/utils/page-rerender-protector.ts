import type { IBaseFormPageProps } from "../pages/types/form-page";

export function serialize(value: unknown): string {
  return JSON.stringify(value, (key, val) => {
    if (key === "ref") return "[ref]";        // ref.current mount'ta değişir → karşılaştırmadan çıkar
    if (typeof val === "function") return "[fn]";
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const proto = Object.getPrototypeOf(val);
      if (proto !== Object.prototype && proto !== null) return "[ref]";
    }
    return val;
  });
}

export function arePropsEqual(
  prev: React.PropsWithChildren<IBaseFormPageProps>,
  next: React.PropsWithChildren<IBaseFormPageProps>,
): boolean {
  return serialize(prev) === serialize(next);
}


