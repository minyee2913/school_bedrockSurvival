import { ItemStack } from "bdsx/bds/inventory";
import { ByteTag, CompoundTag, IntTag, NBT } from "bdsx/bds/nbt";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import { asLine } from "../api/line";
import { calcFacingPos } from "../api/facing";
import _ = require("lodash");
import { IsSafe } from "../api/safe";
import { isMotionBlocking } from "../api/block";

interface gun {
    name: string;
    id: number;
    identifier: string;
    speed: number;
    range: number;
    damage: number;
}

const guns:gun[] = [
    {
        name: "돌 딱총",
        id: 0,
        identifier: "minecraft:stone_hoe",
        speed: 0.5,
        range: 8,
        damage: 5
    }
]

export function giveGun(player: ServerPlayer, id: number): void {
    const gun = guns.find((v)=>v.id === id);
    if (!gun) return;

    const item = ItemStack.constructWith(gun.identifier, 1);

    item.setCustomName(gun.name);
    item.setCustomLore([
        `§r§b탄속§7: ${gun.speed}`,
        `§r§6사거리§7: ${gun.range}칸`,
        `§r§c탄당 피해량§7: ${gun.damage}`,
    ]);

    const nbt = item.save();

    item.load(
        {
            ...nbt,
            tag: {
                ...nbt.tag,
                gun: NBT.int(gun.id),
            },
        },
    );

    player.addItem(item);
    player.sendInventory();

    item.destruct();
}

const shootDelay = Symbol("shootDelay");

events.itemUse.on((ev)=>{
    const playerName = ev.player.getName();
    const tag = ev.itemStack.allocateAndSave();

    const gunId = tag.get<CompoundTag>("tag")?.get<IntTag>("gun")?.data;
    tag.dispose();

    if (gunId === undefined) return;

    const gun = guns.find((v)=>v.id === gunId);
    if (!gun) return;

    const now = _.now();

    if ((ev.player as any)[shootDelay] > now) return;

    (ev.player as any)[shootDelay] = now + gun.speed * 1000;

    const targetPos = calcFacingPos(ev.player, gun.range);

    let stop = false;
    asLine(ev.player.getPosition(), [targetPos], 150, 1, 1, 0, (x, y, z)=>{
        if (!IsSafe(ev.player)) return;
        if (stop) return;

        if (isMotionBlocking({x, y, z})) {
            stop = true;

            return;
        }

        ev.player.runCommand(`particle minecraft:basic_crit_particle ${x} ${y} ${z}`);
        ev.player.runCommand(`tag @e[r=1.5,name=!"${playerName}",x=${x},y=${y},z=${z}] add shoot${playerName.replace(" ", "_")}`);
    }, ()=>{
        if (!IsSafe(ev.player)) return;

        ev.player.runCommand(`damage @e[tag=shoot${playerName.replace(" ", "_")}] ${gun.damage} projectile entity @s`);
        ev.player.runCommand(`tag @e[tag=shoot${playerName.replace(" ", "_")}] remove shoot${playerName.replace(" ", "_")}`);
    });
});
