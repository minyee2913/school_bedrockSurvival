import { ItemStack } from "bdsx/bds/inventory";
import { ByteTag, CompoundTag, NBT } from "bdsx/bds/nbt";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import { preventRepeat } from "../api/antirapid";
import { Form } from "bdsx/bds/form";
import { shopMenu } from "./shop";
import { Notice } from "./notice";
import { FeedScreen } from "./feed";
import { lunchScreen } from "./lunch";
import { timeScreen } from "./timetable";

export function applyMenu(player: ServerPlayer) {
    const slot = player.getInventory().container.getSlots().get(7);

    const item = ItemStack.constructWith("minecraft:compass", 1);
    if (!item) return;

    item.setCustomName("§l§7서버 탐색기");

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
                text: "§l공지",
            },
            {
                text: "§l특수 아이템",
            },
            {
                text: "§l피드 (SNS)",
            },
            {
                text: "§l오늘 급식",
            },
            {
                text: "§l시간표",
            },
        ],
    });

    if (result === 0) {
        Notice(ev.player);
    }

    else if (result === 1) {
        shopMenu(ev.player);
    }

    else if (result === 2) {
        FeedScreen(ev.player);
    }

    else if (result === 3) {
        lunchScreen(ev.player);
    }

    else if (result === 4) {
        timeScreen(ev.player);
    }
});
