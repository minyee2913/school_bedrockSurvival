import { ItemStack } from "bdsx/bds/inventory";
import { ByteTag, CompoundTag, NBT } from "bdsx/bds/nbt";
import { events } from "bdsx/event";
import { calcFacingPos } from "../api/facing";
import { hookEvents } from "../api/hooking/events";
import { bedrockServer } from "bdsx/launcher";
import { ServerPlayer } from "bdsx/bds/player";

const cooldown = Symbol("dashCooldown");

export function applyDash(player: ServerPlayer) {
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
    const tag = ev.itemStack.allocateAndSave();

    const dash = tag.get<CompoundTag>("tag")?.get<ByteTag>("dash")?.data;
    tag.dispose();

    if (dash !== 1) return;

    if ((ev.player as any)[cooldown] > 0) {
        ev.player.sendMessage(`§7재사용까지... §a${Math.floor((ev.player as any)[cooldown] / 2) / 10}s`);
        return;
    }

    ev.player.runCommand(`damage @e[r=3,name=!"${ev.player.getName()}"] 4 projectile entity @s`);

    ev.player.runCommand("particle minecraft:knockback_roar_particle ~ ~1 ~");

    ev.player.runCommand("playsound item.trident.riptide_3 @a[r=20] ~ ~ ~");
    ev.player.runCommand("effect @s resistance 1 255 true");

    if (ev.player.getRotation().x < -60) {
        ev.player.knockback(ev.player, 0, 0, 0, 6, 2, 3);
        ev.player.runCommand("effect @s slow_falling 1 0 true");
    } else {
        const actorPos = ev.player.getFeetPos();
        const facePos = calcFacingPos(ev.player, -2);

        ev.player.knockback(ev.player, 0, facePos.x - actorPos.x, facePos.z - actorPos.z, 8, 0.1, 0.1);
    }

    (ev.player as any)[cooldown] = 20;
});

hookEvents.playerTick.on((ev)=>{
    if ((ev.player as any)[cooldown] > 0) (ev.player as any)[cooldown]--;

    bedrockServer.executeCommand("kill @e[type=item,name=\"§l대쉬\"]");
    bedrockServer.executeCommand("kill @e[type=item,name=\"§l서버 탐색기\"]");
});
