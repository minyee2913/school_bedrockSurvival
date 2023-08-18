import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import _ = require("lodash");

events.entityDie.on((ev)=>{
    //const killer = ev.damageSource.getDamagingEntity();
    if (ev.entity.isPlayer()) {
        const inv = ev.entity.getInventory();

        const slots = inv.container.getSlots().toArray();
        const spawner = bedrockServer.level.getSpawner();

        _(slots).forEach((v, i)=>{
            if (!v.getCustomName().startsWith("§l")) spawner.spawnItem(ev.entity.getRegion(), v, ev.entity.getPosition(), 100);

            v.setAmount(0);
        });
    }
});
