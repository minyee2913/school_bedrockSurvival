import { Form } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { MCInventory } from "../api/inventory";
import { ItemStack } from "bdsx/bds/inventory";
import { NBT } from "bdsx/bds/nbt";

export async function shopMenu(player: ServerPlayer) {
    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: "§l특수 아이템",
        content: "",
        buttons: [
            {
                text: "대쉬\n§7보유함",
            },
            {
                text: "인벤토리 보호 (30s)\n§b다이아몬드 1개",
            },
        ],
    });

    if (result === null) return;

    if (result === 1) {
        if (MCInventory.getItemCount(player, "minecraft:diamond") >= 1) {
            const item = ItemStack.constructWith("minecraft:balloon", 1);

            item.setCustomName("§l인벤토리 보호 §a(30s)");
            item.setCustomLore(["§r§f사용시 30s동안 인벤토리가 보호됩니다."]);

            const nbt = item.save();

            item.load(
                {
                    ...nbt,
                    tag: {
                        ...nbt.tag,
                        protect: NBT.byte(1),
                    }
                }
            );

            player.addItem(item);
            player.sendInventory();

            item.destruct();

            player.runCommand("clear @s diamond 0 1");
            player.runCommand("playsound note.harp @s ~ ~ ~ 0.8");

            player.sendMessage("§a인벤토리 보호를 구매했습니다.");

        }
    }

    shopMenu(player);
}
