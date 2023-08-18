import { ByteTag, CompoundTag } from "bdsx/bds/nbt";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import _ = require("lodash");
import { hookEvents } from "../api/hooking/events";

const protection = Symbol("invProtection");

events.entityDie.on((ev)=>{
    //const killer = ev.damageSource.getDamagingEntity();
    if (ev.entity.isPlayer()) {
        if ((ev.entity as any)[protection] > 0) return;

        const inv = ev.entity.getInventory();

        const slots = inv.container.getSlots().toArray();
        const spawner = bedrockServer.level.getSpawner();

        _(slots).forEach((v, i)=>{
            if (!v.getCustomName().startsWith("§l")) spawner.spawnItem(ev.entity.getRegion(), v, ev.entity.getPosition(), 100);

            v.setAmount(0);
        });
    }
});

events.itemUse.on((ev)=>{
    const tag = ev.itemStack.allocateAndSave();

    const dash = tag.get<CompoundTag>("tag")?.get<ByteTag>("dash")?.data;
    tag.dispose();

    if (dash !== 1) return;

    ev.player.runCommand("playsound random.anvil_land @a[r=20] ~ ~ ~ 0.6 0.7");

    (ev.player as any)[protection] = 30 * 20;

    ev.player.sendMessage("§730s 동안 인벤토리가 보호됩니다.");
});

hookEvents.playerTick.on((ev)=>{
    if ((ev.player as any)[protection] > 0) (ev.player as any)[protection]--;
});
