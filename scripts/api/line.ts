import { CommandResult } from "bdsx/commandresult";
import { VectorXYZ } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { tickTask } from "./tick_task";
import * as _ from "lodash";

export class CustomLocation {
    constructor(public x: number, public y: number, public z: number, multiplier = 1) {
        this.x = (x * multiplier) / 100;
        this.y = (y * multiplier) / 100;
        this.z = (z * multiplier) / 100;
    }

    equals(location: VectorXYZ): boolean {
        return this.x === location.x && this.y === location.y && this.z === location.z;
    }
}

export class LineData {
    dist: number;
    xDiff: number;
    yDiff: number;
    zDiff: number;

    constructor(public pos1: VectorXYZ, public pos2: VectorXYZ) {
        this.pos1 = pos1;
        this.pos2 = pos2;

        const xDiff = pos1.x - pos2.x;
        const yDiff = pos1.y - pos2.y;
        const zDiff = pos1.z - pos2.z;

        this.dist = Math.sqrt(Math.abs(xDiff) ** 2 + Math.abs(yDiff) ** 2 + Math.abs(zDiff) ** 2);
        this.xDiff = xDiff / this.dist;
        this.yDiff = yDiff / this.dist;
        this.zDiff = zDiff / this.dist;
    }

    getDiff(multiplier: number): CustomLocation {
        return new CustomLocation(this.xDiff, this.yDiff, this.zDiff, multiplier);
    }
}

export function runParticle(particle: string, x: number, y: number, z: number): CommandResult<CommandResult.Any> {
    return bedrockServer.executeCommand(`particle ${particle} ${x} ${y} ${z}`);
}

export function showLineParticles(
    pos1: VectorXYZ,
    pos2_array: VectorXYZ[],
    particle: string,
    multiplier: number,
    delayMultiplier: number,
    particlePerDelay: number,
    yOffset: number,
    onEnd: (index: number) => void,
): void {
    _.forEach(pos2_array, (pos2, ii) => {
        const line = new LineData(pos1, pos2);
        const diff = line.getDiff(multiplier);
        const increaseCount = Math.ceil(line.dist) * Math.round(100 / multiplier);

        for (let i = 0; i <= increaseCount; i++) {
            if (i === increaseCount) {
                const delay = Math.floor(((i - 1) * delayMultiplier) / particlePerDelay);
                tickTask(delay + 1, () => onEnd(ii));
                continue;
            }
            const executable = (): CommandResult<CommandResult.Any> =>
                runParticle(particle, pos1.x - diff.x * i, pos1.y - diff.y * i + yOffset, pos1.z - diff.z * i);
            const delay = Math.floor((i * delayMultiplier) / particlePerDelay);

            tickTask(delay, executable);
        }
    });
}

export function asLine(
    pos1: VectorXYZ,
    pos2_array: VectorXYZ[],
    multiplier: number,
    delayMultiplier: number,
    particlePerDelay: number,
    yOffset: number,
    onLine: (x: number, y: number, z: number) => void,
    onEnd: (index: number) => void,
): void {
    _.forEach(pos2_array, (pos2, ii) => {
        const line = new LineData(pos1, pos2);
        const diff = line.getDiff(multiplier);
        const increaseCount = Math.ceil(line.dist) * Math.round(100 / multiplier);

        for (let i = 0; i <= increaseCount; i++) {
            if (i === increaseCount) {
                const delay = Math.floor(((i - 1) * delayMultiplier) / particlePerDelay);
                tickTask(delay + 1, () => onEnd(ii));
                continue;
            }
            const executable = (): void => onLine(pos1.x - diff.x * i, pos1.y - diff.y * i + yOffset, pos1.z - diff.z * i);
            const delay = Math.floor((i * delayMultiplier) / particlePerDelay);

            tickTask(delay, executable);
        }
    });
}
