import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { applyDash } from "./dash";
import { applyMenu } from "./menu";
import { AttributeId } from "bdsx/bds/attribute";

events.playerJoin.on((ev)=>{
    bedrockServer.executeCommand("gamerule sendcommandfeedback false");
    bedrockServer.executeCommand("gamerule showtags true");
    bedrockServer.executeCommand("gamerule dodaylightcycle false");
    bedrockServer.executeCommand("gamerule keepinventory true");

    const slots = ev.player.getInventory().container.getSlots();
    slots.toArray().forEach((v)=>{
        if (v.getCustomName().startsWith("§l")) v.setAmount(0);
    });

    ev.player.sendInventory();

    applyDash(ev.player);
    applyMenu(ev.player);

    const hp = ev.player.getAttributes().getMutableInstance(AttributeId.Health);
    if (hp) {
        hp.minValue = -1;
        hp.maxValue = 30;
    }
});

events.playerRespawn.on((ev)=>{
    ev.player.runCommand("replaceitem entity @s slot.hotbar 0 iron_axe");

    applyDash(ev.player);
    applyMenu(ev.player);
});
