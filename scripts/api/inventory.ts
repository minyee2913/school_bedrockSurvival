import { Container, ContainerId, ItemStack, PlayerInventory } from "bdsx/bds/inventory";
import { Player } from "bdsx/bds/player";
import { Event } from "bdsx/eventtarget";
import { bool_t, int32_t, uint8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

function getItemCount_js(container: Container, item: ItemStack): number {
    let count = 0;
    const slots = container.getSlots();
    for (const s of slots) {
        if (s.getId() === item.getId()) count += s.getAmount();
    }
    slots.destruct();
    return count;
}

procHacker.hooking(
    "?getItemCount@Container@@UEBAHAEBVItemStack@@@Z",
    int32_t,
    null,
    Container,
    ItemStack,
)((self, item) => {
    return getItemCount_js(self, item);
});

export class InventorySelectSlot {
    constructor(public inventory: PlayerInventory, public slot: number, public containerId: ContainerId) {}
}

export namespace MCInventory {
    export function getItemCount(player: Player, item: string): number;
    export function getItemCount(player: Player, item: ItemId): number;
    export function getItemCount(player: Player, item: ItemStack): number;
    export function getItemCount(target: Player | Container, argItem: ItemId | ItemStack | string): number {
        const isItem = argItem instanceof ItemStack;
        const container = target instanceof Container ? target : target.getInventory().container;

        const item = isItem ? argItem : ItemStack.constructWith(argItem);
        const count = item.getId() === 0 /**is air*/ ? 0 : container.getItemCount(item);
        if (!isItem) item.destruct();
        return count;
    }

    export const selectSlot = new Event<(ev: InventorySelectSlot) => void>();
}

function inventorySelectSlot(inventory: PlayerInventory, slot: number, containerId: ContainerId): bool_t {
    const event = new InventorySelectSlot(inventory, slot, containerId);
    MCInventory.selectSlot.fire(event);

    return inventory$selectSlot(inventory, slot, containerId);
}

const inventory$selectSlot = procHacker.hooking(
    "?selectSlot@PlayerInventory@@QEAA_NHW4ContainerID@@@Z",
    bool_t,
    null,
    PlayerInventory,
    int32_t,
    uint8_t,
)(inventorySelectSlot);
