import { NetworkIdentifier } from "bdsx/bds/networkidentifier";

export namespace MCBossBar {
    export function set(target: NetworkIdentifier, title: string, healthPercent: number): void {
        const player = target.getActor();
        if (!player) return;
        player.setBossBar(title, healthPercent);
    }

    export function remove(target: NetworkIdentifier): void {
        const player = target.getActor();
        if (!player) return;
        player.removeBossBar();
    }
}
