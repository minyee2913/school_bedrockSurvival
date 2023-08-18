import { ItemStack } from "bdsx/bds/inventory";
import { NBT } from "bdsx/bds/nbt";
import { events } from "bdsx/event";
import { calcFacingPos } from "../api/facing";
import { hookEvents } from "../api/hooking/events";
import { bedrockServer } from "bdsx/launcher";
import { ServerPlayer } from "bdsx/bds/player";

const cooldown = Symbol("dashCooldown");

events.playerJoin.on((ev)=>{
    apply(ev.player);
});

events.playerRespawn.on((ev)=>{
    apply(ev.player);
});

function apply(player: ServerPlayer) {
    const slot = player.getInventory().container.getSlots().get(8);

    const item = ItemStack.constructWith("minecraft:paper", 1);
    if (!item) return;

    item.setCustomName("§7대쉬");

    const nbt = item.save();

    slot.load(
        {
            ...nbt,
            tag: {
                "minecraft:item_lock": NBT.byte(1),
                ...nbt.tag,
                xuid: player.getXuid(),
                dash: NBT.byte(1),
            }
        }
    );

    player.sendInventory();
    item.destruct();
}

events.itemUse.on((ev)=>{
    if ((ev.player as any)[cooldown] > 0) {
        ev.player.sendMessage(`§7재사용까지... §a${Math.floor((ev.player as any)[cooldown] / 2) / 10}s`);
        return;
    }

    ev.player.runCommand("playsound item.trident.riptide_3 @a[r=20] ~ ~ ~");

    const actorPos = ev.player.getFeetPos();
    const facePos = calcFacingPos(ev.player, -2);

    ev.player.knockback(ev.player, 0, facePos.x - actorPos.x, facePos.z - actorPos.z, 8, 0.1, 0.1);

    (ev.player as any)[cooldown] = 20;
});

hookEvents.playerTick.on((ev)=>{
    if ((ev.player as any)[cooldown] > 0) (ev.player as any)[cooldown]--;

    bedrockServer.executeCommand("kill @e[type=item,name=\"§l대쉬\"");
});
