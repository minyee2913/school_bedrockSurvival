import { Actor } from "bdsx/bds/actor";
import { VoidPointer } from "bdsx/core";
import { decay } from "bdsx/decay";

export function IsSafe(obj: Record<string, any> | null | undefined): boolean {
    if (!obj) return false;
    if (obj instanceof VoidPointer) {
        if (decay.isDecayed(obj)) return false;
    }
    if (obj instanceof Actor) {
        if (!obj.ctxbase.isValid()) return false;
        if (!obj.ctxbase) return false;
    }
    return true;
}
