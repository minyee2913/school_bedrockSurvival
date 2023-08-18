import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";

const repeat = new WeakMap<NetworkIdentifier, number>();

export function preventRepeat(player: ServerPlayer): boolean {
    const date = Date.now();

    const target = player.getNetworkIdentifier();

    const time = repeat.get(target);
    if (time && date < time) {
        repeat.set(target, date + 1000);
        return true;
    } else {
        repeat.set(target, date + 1000);
    }

    return false;
}

events.playerLeft.on((ev) => {
    const target = ev.player.getNetworkIdentifier();

    if (repeat.has(target)) repeat.delete(target);
});
