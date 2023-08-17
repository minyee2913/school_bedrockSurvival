import { VectorXYZ } from "bdsx/common";

export function getDistanceVec3(pos1: VectorXYZ, pos2: VectorXYZ): number {
    const a = Math.pow(pos1.x - pos2.x, 2);
    const b = Math.pow(pos1.y - pos2.y, 2);
    const c = Math.pow(pos1.z - pos2.z, 2);
    return Math.sqrt(a + b + c);
}
