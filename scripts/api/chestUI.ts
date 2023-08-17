import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { EnchantUtils } from "bdsx/bds/enchants";
import { ContainerType, ItemStack } from "bdsx/bds/inventory";
import { ByteTag, IntTag, NBT, StringTag } from "bdsx/bds/nbt";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import {
    BlockActorDataPacket,
    ContainerClosePacket,
    ContainerOpenPacket,
    InventorySlotPacket,
    ItemStackRequestActionTransferBase,
    ItemStackRequestActionType,
    UpdateBlockPacket,
} from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { emptyFunc } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { uint32_t, uint8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";
import * as _ from "lodash";

export const InventorySlotPacket$InventorySlotPacket = procHacker.js(
    "??0InventorySlotPacket@@QEAA@W4ContainerID@@IAEBVItemStack@@@Z",
    InventorySlotPacket,
    null,
    InventorySlotPacket,
    uint8_t,
    uint32_t,
    ItemStack,
);

const chestData = new Map<NetworkIdentifier, chestUI>();

export type ItemJson = {
    identifier: string;
    name?: string;
    Lore?: string[] | string;
    durability?: number;
    count?: number;
    data?: number;
    tag?: string;
    enchant?: Record<number, number>;
    itemLock?: number;
};

export type ItemInput = ItemStack | ItemJson | string;

export class chestUI {
    protected target: NetworkIdentifier;
    protected pos: BlockPos;
    protected block: Block = Block.create("minecraft:chest")!;
    containerId: number;
    protected sent = false;
    protected chestName = "gui";

    slots = new Map<number, ItemStack>();
    slotSize = 26;
    protected beforeRuntimeId: number;

    protected isDoubleChest = false;
    protected doublePos: BlockPos;
    protected doubleRuntimeId: number;
    protected delayToOpen = 0;

    onItemSelected: (idx: number, itemStack: ItemStack | undefined, ui: chestUI) => void = emptyFunc;
    onClose: () => void = emptyFunc;

    static create(player: ServerPlayer): chestUI {
        return new chestUI(player);
    }
    constructor(player: ServerPlayer) {
        this.changePlayer(player);
    }

    toDoubleChest(): chestUI {
        const actor = this.target.getActor();
        if (!actor) return this;
        this.slotSize = 53;
        this.isDoubleChest = true;
        this.doublePos = BlockPos.construct(this.pos);
        this.doublePos.x += 1;

        this.doubleRuntimeId = actor.getRegion().getBlock(this.doublePos).getRuntimeId();
        this.delayToOpen = 0.1;

        this.place();
        return this;
    }

    changePlayer(player: ServerPlayer): chestUI {
        if (chestData.has(this.target)) {
            chestData.delete(this.target);
            this.destroy();
        }

        this.target = player.getNetworkIdentifier();
        this.containerId = player.nextContainerCounter();
        const playerPos = player.getFeetPos();
        this.pos = BlockPos.create(Math.floor(playerPos.x), Math.floor(playerPos.y - 1), Math.floor(playerPos.z));
        this.beforeRuntimeId = player.getRegion().getBlock(this.pos).getRuntimeId();

        chestData.set(this.target, this);

        return this;
    }

    setChestName(name: string): chestUI {
        this.chestName = name;
        return this;
    }

    setItem(item: ItemInput, idx: number): chestUI {
        if (idx > this.slotSize) throw new Error(`Slot ${idx} is out of range!`);

        if (this.slots.has(idx)) {
            this.slots.get(idx)!.destruct();
            this.slots.delete(idx);
        }

        if (item instanceof ItemStack) {
            this.slots.set(idx, item);
        } else if (typeof item === "string") {
            const tag = NBT.parse(item) as NBT.Compound;
            const itemStack = ItemStack.fromTag(tag);

            this.slots.set(idx, itemStack);
        } else {
            const itemStack = ItemStack.constructWith(item.identifier, item.count, item.data);

            if (item.tag) {
                const tag = NBT.parse(item.tag) as NBT.Compound;
                itemStack.load(tag);
            }

            if (item.itemLock !== undefined) {
                const tag = itemStack.allocateAndSave();

                tag.setAllocated(
                    "tag",
                    NBT.allocate({
                        "minecraft:item_lock": NBT.byte(item.itemLock),
                    }),
                );

                itemStack.load(tag);
            }

            if (item.name !== undefined) itemStack.setCustomName(item.name);
            if (item.Lore !== undefined) itemStack.setCustomLore(item.Lore);

            if (item.durability && itemStack.isDamageableItem()) itemStack.setDamageValue(item.durability);

            if (item.enchant) {
                for (const key in item.enchant) {
                    EnchantUtils.applyEnchant(itemStack, Number(key), (item.enchant as any)[key], true);
                }
            }

            this.slots.set(idx, itemStack);
        }

        if (this.hasContainer()) this.loadSlot(idx);
        return this;
    }

    setItems(items: ItemInput[] | Record<number, ItemInput>): chestUI {
        if (Array.isArray(items)) {
            _.forEach(items, (v, i) => {
                this.setItem(v, i);
            });
        } else {
            for (const key in items) {
                const i = Number(key);
                const item = items[key];

                this.setItem(item, i);
            }
        }

        return this;
    }

    hasContainer(): boolean {
        const actor = this.target.getActor();
        if (!actor) return false;

        const hasContainer = actor.hasOpenContainer();
        if (hasContainer) return true;

        return this.sent;
    }

    protected loadSlot(idx: number): chestUI {
        const item = this.slots.get(idx);

        if (item) {
            const pk = InventorySlotPacket.allocate();
            InventorySlotPacket$InventorySlotPacket(pk, this.containerId, idx, item);

            pk.sendTo(this.target);
            pk.dispose();
        }

        return this;
    }

    reload(): boolean {
        if (!this.hasContainer()) return false;

        this.slots.forEach((item, idx) => {
            this.loadSlot(idx);
        });

        return true;
    }

    send(): chestUI {
        if (!this.isDoubleChest) this.place();

        bedrockServer.serverInstance.nextTick().then(() => {
            setTimeout(() => {
                this.sent = true;

                const pk = ContainerOpenPacket.allocate();
                pk.containerId = this.containerId;
                pk.type = ContainerType.Container;
                pk.pos.construct(this.pos);
                pk.sendTo(this.target);
                pk.dispose();

                this.reload();
            }, this.delayToOpen * 1000);
        });

        return this;
    }

    close(): void {
        const pk = ContainerClosePacket.allocate();
        pk.containerId = this.containerId;
        pk.server = true;
        pk.sendTo(this.target);
        pk.dispose();

        this.destroy();
    }

    protected place(): void {
        const pk = UpdateBlockPacket.allocate();
        pk.blockPos.set(this.pos);
        pk.dataLayerId = 0;
        pk.flags = UpdateBlockPacket.Flags.Network;
        pk.blockRuntimeId = this.block.getRuntimeId();
        pk.sendTo(this.target);
        pk.dispose();

        if (this.isDoubleChest) {
            const pk = UpdateBlockPacket.allocate();
            pk.blockPos.set(this.doublePos);
            pk.dataLayerId = 0;
            pk.flags = UpdateBlockPacket.Flags.Network;
            pk.blockRuntimeId = this.block.getRuntimeId();
            pk.sendTo(this.target);
            pk.dispose();
        }

        const pk1 = BlockActorDataPacket.allocate();
        pk1.pos.set(this.pos);
        const name = StringTag.constructWith(this.chestName);
        pk1.data.set("CustomName", name);
        if (this.isDoubleChest) {
            const pairlead = ByteTag.constructWith(1);
            const pairx = IntTag.constructWith(this.doublePos.x);
            const pairz = IntTag.constructWith(this.doublePos.z);

            pk1.data.set("pairlead", pairlead);
            pk1.data.set("pairx", pairx);
            pk1.data.set("pairz", pairz);

            pk1.sendTo(this.target);

            pairlead.destruct();
            pairx.destruct();
            pairz.destruct();
        } else pk1.sendTo(this.target);
        name.destruct();
        pk1.dispose();

        if (this.isDoubleChest) {
            const pk1 = BlockActorDataPacket.allocate();
            pk1.pos.set(this.doublePos);
            const name = StringTag.constructWith(this.chestName);
            pk1.data.set("CustomName", name);
            const pairlead = ByteTag.constructWith(0);
            const pairx = IntTag.constructWith(this.pos.x);
            const pairz = IntTag.constructWith(this.pos.z);

            pk1.data.set("pairlead", pairlead);
            pk1.data.set("pairx", pairx);
            pk1.data.set("pairz", pairz);

            pk1.sendTo(this.target);

            pairlead.destruct();
            pairx.destruct();
            pairz.destruct();
            name.destruct();
            pk1.dispose();
        }
    }

    destroy(): void {
        if (chestData.has(this.target)) chestData.delete(this.target);

        this.slots.forEach((v) => {
            v.destruct();
        });
        this.block.destruct();

        const pk = UpdateBlockPacket.allocate();
        pk.blockPos.set(this.pos);
        pk.dataLayerId = 0;
        pk.flags = UpdateBlockPacket.Flags.Network;
        pk.blockRuntimeId = this.beforeRuntimeId;
        pk.sendTo(this.target);
        pk.dispose();

        if (this.isDoubleChest) {
            const pk = UpdateBlockPacket.allocate();
            pk.blockPos.set(this.doublePos);
            pk.dataLayerId = 0;
            pk.flags = UpdateBlockPacket.Flags.Network;
            pk.blockRuntimeId = this.doubleRuntimeId;
            pk.sendTo(this.target);
            pk.dispose();
        }
    }

    setItemSelectedEvent(ev: (idx: number, itemStack: ItemStack | undefined, ui: chestUI) => void): chestUI {
        this.onItemSelected = ev;
        return this;
    }

    setCloseEvent(ev: () => void): chestUI {
        this.onClose = ev;
        return this;
    }

    fillWith(item: ItemInput, overwrite = false): chestUI {
        for (let i = 0; i <= this.slotSize; i++) {
            if (!overwrite && this.slots.get(i)) continue;
            this.setItem(item, i);
        }
        return this;
    }
}

events.packetBefore(MinecraftPacketIds.ItemStackRequest).on((pkt, target) => {
    const actor = target.getActor();
    if (!actor) return;

    const uiData = chestData.get(target);
    if (!uiData) return;

    if (!uiData.hasContainer()) return;

    const data = pkt.getRequestBatch().data.get(0);
    const action = data?.getActions().get(0);

    if (
        (action?.type === ItemStackRequestActionType.Take && action instanceof ItemStackRequestActionTransferBase) ||
        (action?.type === ItemStackRequestActionType.Place && action instanceof ItemStackRequestActionTransferBase)
    ) {
        const slotInfo = action.getSrc();

        const slot = slotInfo.slot;
        const itemStack = uiData.slots.get(slot);

        if (!itemStack) return;
        bedrockServer.serverInstance.nextTick().then(() => {
            // if (itemStack) {
            //     actor.getCursorSelectedItem().load(itemStack.save());

            //     uiData.setItem({
            //         identifier: "minecraft:air"
            //     }, slot);

            //     actor.sendInventory(true);
            // }

            uiData.onItemSelected(slot, itemStack, uiData);
        });
    }
});

events.packetBefore(MinecraftPacketIds.ContainerClose).on((pkt, target) => {
    const uiData = chestData.get(target);
    if (!uiData) return;

    if (!uiData.hasContainer()) return;
    if (pkt.containerId !== uiData.containerId) return;

    uiData.onClose();
    uiData.destroy();
});

events.playerLeft.on((ev) => {
    const uiData = chestData.get(ev.player.getNetworkIdentifier());
    if (!uiData) return;

    uiData.destroy();
});
