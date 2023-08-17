import { Actor } from "bdsx/bds/actor";
import { Vec2, Vec3 } from "bdsx/bds/blockpos";
import { VectorXYZ } from "bdsx/common";
import { int32_t } from "bdsx/nativetype";

const RadPerDegree = Math.PI / 180;

export function makeCommandPos(pos: VectorXYZ): string {
    return `${pos.x} ${pos.y} ${pos.z}`;
}

export function calcFacingPos(entity: Actor, dist: int32_t, offset?: VectorXYZ): Vec3;
export function calcFacingPos(pos: VectorXYZ, rot: Vec2, dist: int32_t, offset?: VectorXYZ): Vec3;
export function calcFacingPos(
    source: Actor | VectorXYZ,
    dist_rot: int32_t | Vec2,
    off_dist: (VectorXYZ | undefined) | int32_t,
    _offset = Vec3.create(0, 0, 0),
): Vec3 {
    let pos: VectorXYZ;
    let rot: Vec2;
    let dist: int32_t;
    let offset: VectorXYZ;

    if (source instanceof Actor) {
        // Clones to protect native projects
        // pos = source.getFeetPos();
        // rot = source.getRotation();
        dist = dist_rot as number;
        // offset = off_dist ? (off_dist as VectorXYZ) : Vec3.create(0, 0, 0);
        const viewVec = source.getViewVector();
        const facingPos = Vec3.construct(source.getPosition());
        facingPos.x += viewVec.x *= dist;
        facingPos.y += viewVec.y *= dist;
        facingPos.z += viewVec.z *= dist;
        return facingPos;
    } else {
        // Clones to protect native projects
        pos = source;
        rot = dist_rot as Vec2;
        dist = off_dist as number;
        offset = _offset;
    }

    return _calcFacingPos(pos, rot, dist, offset);
}

export function calcFacingPosToRight(entity: Actor, dist: int32_t, offset?: VectorXYZ): Vec3;
export function calcFacingPosToRight(pos: VectorXYZ, rot: Vec2, dist: int32_t, offset?: VectorXYZ): Vec3;
export function calcFacingPosToRight(
    source: Actor | VectorXYZ,
    dist_rot: int32_t | Vec2,
    off_dist: (VectorXYZ | undefined) | int32_t,
    _offset = Vec3.create(0, 0, 0),
): Vec3 {
    let pos: VectorXYZ;
    let rot: Vec2;
    let dist: int32_t;
    let offset: VectorXYZ;

    if (source instanceof Actor) {
        pos = source.getFeetPos();
        rot = Vec2.construct(source.getRotation()); // clone by original native object to make it mutable.
        dist = dist_rot as number;
        offset = off_dist as VectorXYZ;
    } else {
        pos = source;
        rot = Vec2.construct(dist_rot as Vec2); // clone by original native object to make it mutable.
        dist = off_dist as number;
        offset = _offset as VectorXYZ;
    }

    rot.y -= 90; // turn to left
    return _calcFacingPos(pos, rot, dist, offset);
}

function _calcFacingPos(position: VectorXYZ, rot: Vec2, dist: number, offset: VectorXYZ = Vec3.create(0, 0, 0)): Vec3 {
    const pos = Vec3.create(position.x, position.y, position.z); // clone

    const radY = rot.y * RadPerDegree;
    const radX = rot.x * RadPerDegree;

    const y = -Math.sin(radX) * dist;

    const manipulator = Math.cos(radX);
    const x = -Math.sin(radY) * manipulator * dist;
    const z = Math.cos(radY) * manipulator * dist;

    pos.y += offset.y + y;

    pos.x += offset.x + x;
    pos.z += offset.z + z;

    return pos;
}
