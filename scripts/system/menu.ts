import { ItemStack } from "bdsx/bds/inventory";
import { ByteTag, CompoundTag, NBT } from "bdsx/bds/nbt";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import { preventRepeat } from "../api/antirapid";
import { Form } from "bdsx/bds/form";
import { shopMenu } from "./shop";

export function applyMenu(player: ServerPlayer) {
    const slot = player.getInventory().container.getSlots().get(7);

    const item = ItemStack.constructWith("minecraft:compass", 1);
    if (!item) return;

    item.setCustomName("§7서버 탐색기");

    const nbt = item.save();

    slot.load(
        {
            ...nbt,
            tag: {
                "minecraft:item_lock": NBT.byte(1),
                ...nbt.tag,
                xuid: player.getXuid(),
                menu: NBT.byte(1),
            }
        }
    );

    player.sendInventory();
    item.destruct();
}

events.itemUse.on(async (ev)=>{
    const tag = ev.itemStack.allocateAndSave();

    const menu = tag.get<CompoundTag>("tag")?.get<ByteTag>("menu")?.data;
    tag.dispose();

    if (menu !== 1) return;

    if (preventRepeat(ev.player)) return;

    ev.player.runCommand("playsound note.hat @a[r=20] ~ ~ ~");

    const result = await Form.sendTo(ev.player.getNetworkIdentifier(), {
        type: "form",
        title: "§l서버 탐색기",
        content: "",
        buttons: [
            {
                text: "§l특수 아이템",
            },
        ],
    });

    if (result === 0) {
        shopMenu(ev.player);
    }
});
