//
// _______        _______    __     _____     ______    ___      ___                                                      ________          ___      __________
// |      \      /      |   |__|    |    \    |    |    \  \    /  /    ___________     ___________       __________    _|        |__      /   |    |  ____    |
// |       \    /       |    __     |     \   |    |     \  \  /  /     |   _______|    |   _______|     |  ____    |   |           |     /_   |    |__|  |    |
// |        \__/        |   |  |    |      \  |    |      \  \/  /      |  |_______     |  |_______      |__|   /   |   |_          |       |  |       ___|    |
// |     |\      /|     |   |  |    |   |\  \ |    |       |    |       |   _______|    |   _______|           /   /      |______   |       |  |     _|___     |
// |     | \____/ |     |   |  |    |   | \  \|    |       |    |       |  |_______     |  |_______       ____/   /__            |  |    ___|  |__  |  |__|    |
// |_____|        |_____|   |__|    |___|  \_______|       |____|       |__________|    |__________|     |___________|           |__|   |_________| |__________|
//
//

import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import _ = require("lodash");
import { PlayerTickEvent, hookEvents } from "./hooking/events";

export function Sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const cams = new WeakMap<NetworkIdentifier, Camera>();

events.playerJoin.on((ev)=>{
    cams.set(ev.player.getNetworkIdentifier(), new Camera(ev.player));
});

events.playerLeft.on((ev)=>{
    const cam = Camera.get(ev.player);
    if (!cam) return;

    cam.destruct();
});

type camPresent = "default" | "minecraft:free" | "minecraft:first_person" | "minecraft:third_person" | "minecraft:third_person_front";

export class Camera {
    constructor (private _player: ServerPlayer) {
        this.listener = (ev: PlayerTickEvent)=>{
            if (ev.player !== _player) return;

            if (!this.isWaitingMove || this.waitingDelay === null) return;

            if (this.waitingDelay < _.now()) {
                this.clear();
            } else if (ev.player.isMoving()) {
                this.clear();
            }
        };

        hookEvents.playerTick.on(this.listener);
    }

    static get(player: ServerPlayer): Camera {
        const f = cams.get(player.getNetworkIdentifier());
        if (!f) {
            const cam = new Camera(player);
            cams.set(player.getNetworkIdentifier(), cam);

            return cam;
        }

        return f;
    }

    private listener: (ev: PlayerTickEvent) => void;
    private subject: string | null = null;

    private present: camPresent = "default";

    public isWaitingMove = false;
    public waitingDelay: number | null = null;

    setSubject(subject: string): Camera {
        this.subject = subject;

        return this;
    }

    getSubject(): string | null {
        return this.subject;
    }

    getPresent(): camPresent {
        return this.present;
    }

    set(present: camPresent, command: string, subject?: string): Camera {
        if (subject && subject !== this.subject) return this;

        this.present = present;

        this._player.runCommand(`camera @s set ${present} ${command}`);

        return this;
    }

    fadeColor(r: number, g: number, b: number, subject?: string): Camera {
        if (subject && subject !== this.subject) return this;

        this._player.runCommand(`camera @s fade color ${r} ${g} ${b}`);

        return this;
    }

    fadeTime(fadeInSec: number, holdSec: number, fadeOutSec: number, subject?: string): Camera {
        if (subject && subject !== this.subject) return this;

        this._player.runCommand(`camera @s fade time ${fadeInSec} ${holdSec} ${fadeOutSec}`);

        return this;
    }

    fade(fadeInSec: number, holdSec: number, fadeOutSec: number, r: number, g: number, b: number, subject?: string): Camera {
        if (subject && subject !== this.subject) return this;

        this._player.runCommand(`camera @s fade time ${fadeInSec} ${holdSec} ${fadeOutSec} color ${r} ${g} ${b}`);

        return this;
    }

    clearOnMove(waitingDelay: number, subject?: string): void {
        if (subject && subject !== this.subject) return;

        this.waitingDelay = _.now() + waitingDelay;
        this.isWaitingMove = true;

    }

    async clear(delay?: number, subject?: string): Promise<Camera> {
        if (subject && subject !== this.subject) return this;

        if (delay) await Sleep(delay);

        this.present = "default";
        this.subject = null;
        this.isWaitingMove = false;
        this.waitingDelay = null;
        this._player.runCommand("camera @s clear");

        return this;
    }

    destruct(): void {
        hookEvents.playerTick.remove(this.listener);
        cams.delete(this._player.getNetworkIdentifier());
    }
}
