import { MobEffectIds } from "bdsx/bds/effects";
import { showScreenAnimation } from "../api/ScreenAnimation";
import { hookEvents } from "../api/hooking/events";

const tickSymbol = Symbol("pvpTick");
const pvpSymbol = Symbol("pvpTask");

hookEvents.playerTick.on((ev)=>{
    if ((ev.player as any)[tickSymbol] === undefined) (ev.player as any)[tickSymbol] = 0;
    else (ev.player as any)[tickSymbol]++;

    if ((ev.player as any)[tickSymbol] >= 3) {
        (ev.player as any)[tickSymbol] = 0;

        const detect = ev.player.runCommand(`testfor @p[r=25,name=!"${ev.player.getName()}"]`).result === 1;

        if (detect) {
            if ((ev.player as any)[pvpSymbol] === true) {
                ev.player.sendActionbar("§6주변에 플레이어가 있습니다!");
            } else {
                (ev.player as any)[pvpSymbol] = true;
                ev.player.sendTitle("§c*", "§6주변에 플레이어가 있습니다.");

                showScreenAnimation(ev.player, MobEffectIds.Haste);
                ev.player.runCommand("playsound random.totem @s ~ ~ ~ 0.8");
            }
        } else if ((ev.player as any)[pvpSymbol] === true) {
            (ev.player as any)[pvpSymbol] = false;
        }
    }
});