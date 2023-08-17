import { Actor, ActorDamageSource } from "bdsx/bds/actor";
import { BlockLegacy, BlockSource, ChestBlockActor } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { ChunkSource, LevelChunk } from "bdsx/bds/chunk";
import { ArmorSlot, ContainerId, ItemStack } from "bdsx/bds/inventory";
import { ContainerClosePacket } from "bdsx/bds/packets";
import { Player, ServerPlayer } from "bdsx/bds/player";
import { CANCEL } from "bdsx/common";
import { decay } from "bdsx/decay";
import { Event } from "bdsx/eventtarget";
import { nativeClass } from "bdsx/nativeclass";
import { CxxString, bool_t, int32_t, int64_as_float_t, uint8_t, void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

export class PlayerEvent {
    constructor(public player: ServerPlayer) {}
}

export class AddTagEvent {
    constructor(public actor: Actor, public tag: string) {}
}
export class RemoveTagEvent {
    constructor(public actor: Actor, public tag: string) {}
}

export class AddItemEvent {
    constructor(public player: ServerPlayer, public itemStack: ItemStack) {}
}

export class ChunkLoadedEvent {
    constructor(public source: ChunkSource, public chunk: LevelChunk) {}
}

export class PlayerSetArmorEvent {
    constructor(public player: ServerPlayer, public armorSlot: ArmorSlot, public itemStack: ItemStack) {}
}

export class actuallyHurtEvent {
    constructor(public actor: Actor, public damage: number, public source: ActorDamageSource, public bypassArmor: boolean) {}
}

function addTag(actor: Actor, tag: string): boolean {
    const event = new AddTagEvent(actor, tag);
    hookEvents.addTag.fire(event);

    return addTag_(event.actor, event.tag);
}
const addTag_ = procHacker.hooking(
    "?addTag@Actor@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    null,
    Actor,
    CxxString,
)(addTag);

function removeTag(actor: Actor, tag: string): boolean {
    const event = new RemoveTagEvent(actor, tag);
    hookEvents.removeTag.fire(event);

    return removeTag_(event.actor, event.tag);
}
const removeTag_ = procHacker.hooking(
    "?removeTag@Actor@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    null,
    Actor,
    CxxString,
)(removeTag);

function addItem(actor: ServerPlayer, itemStack: ItemStack): void {
    const event = new AddItemEvent(actor, itemStack);
    hookEvents.addItem.fire(event);
    decay(itemStack);
    return addItem_(event.player, event.itemStack);
}
const addItem_ = procHacker.hooking("?add@Player@@UEAA_NAEAVItemStack@@@Z", void_t, null, Player, ItemStack)(addItem);

function setArmor(actor: ServerPlayer, armorSlot: ArmorSlot, itemStack: ItemStack): void {
    const event = new PlayerSetArmorEvent(actor, armorSlot, itemStack);
    hookEvents.playerSetArmor.fire(event);
    //console.log(itemStack.getItem()!.getCommandName());
    return setArmor_(event.player, event.armorSlot, event.itemStack);
}
const setArmor_ = procHacker.hooking("?setArmor@ServerPlayer@@UEAAXW4ArmorSlot@@AEBVItemStack@@@Z", void_t, null, ServerPlayer, int32_t, ItemStack)(setArmor);

class ButtonClickedEvent {
    constructor(public button: ButtonBlock, public player: Player, public blockPos: BlockPos, public direction: uint8_t) {}
}

@nativeClass(null)
class ButtonBlock extends BlockLegacy {}

const onButtonClicked_ = procHacker.hooking(
    "?use@ButtonBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
    bool_t,
    null,
    ButtonBlock,
    Player,
    BlockPos,
    uint8_t,
)((self, player, pos, unknown) => {
    const canceled = hookEvents.onButtonClicked.fire(new ButtonClickedEvent(self, player, pos, unknown)) === CANCEL;
    if (canceled) return false;
    const ret = onButtonClicked_(self, player, pos, unknown);
    return ret;
});

// function onChunkLoaded(level: Level, chunkSource: ChunkSource, chunk: LevelChunk): void {
//     const event = new ChunkLoadedEvent(chunkSource, chunk);
//     hookEvents.onChunkLoaded.fire(event);

//     return onChunkLoaded_(level, event.source, event.chunk);
// }
// const onChunkLoaded_ = procHacker.hooking(
//     "?onChunkLoaded@Level@@UEAAXAEAVChunkSource@@AEAVLevelChunk@@@Zd",
//     void_t,
//     null,
//     Level,
//     ChunkSource,
//     LevelChunk,
// )(onChunkLoaded);

class ChestBlockActorChangedEvent {
    constructor(public blockActor: ChestBlockActor, public blockSource: BlockSource) {}
}
function onChanged(chestBlockActor: ChestBlockActor, blockSource: BlockSource): void_t {
    const event = new ChestBlockActorChangedEvent(chestBlockActor, blockSource);
    const cancel = hookEvents.chestBlockChanged.fire(event) === CANCEL;
    if (cancel) return;
    return _onChanged(chestBlockActor, blockSource);
}
const _onChanged = procHacker.hooking("?onChanged@ChestBlockActor@@UEAAXAEAVBlockSource@@@Z", void_t, null, ChestBlockActor, BlockSource)(onChanged);

export class PlayerTickEvent {
    constructor(public player: ServerPlayer, public tick: int64_as_float_t) {}
}
function onPlayerTick(player: Player, tick: int64_as_float_t): void_t {
    if (player.isPlayer()) hookEvents.playerTick.fire(new PlayerTickEvent(player, tick));
    return _playerTickWorld(player, tick);
}
const _playerTickWorld = procHacker.hooking("?tickWorld@Player@@UEAAXAEBUTick@@@Z", void_t, null, Player, int64_as_float_t.ref())(onPlayerTick);

function onOpenInventory(player: ServerPlayer): void {
    if (hookEvents.openInventory.fire(new PlayerEvent(player)) === CANCEL) {
        setTimeout(() => {
            const pkt = ContainerClosePacket.allocate();
            pkt.containerId = ContainerId.Inventory;
            pkt.server = true;
            player.sendNetworkPacket(pkt);
            pkt.dispose();
        }, 100);
    }
    return _openInventory(player);
}
const _openInventory = procHacker.hooking("?openInventory@ServerPlayer@@UEAAXXZ", void_t, null, ServerPlayer)(onOpenInventory);

class _EntityIsMovingEvent {
    constructor(public blockActor: ChestBlockActor, public blockSource: BlockSource) {}
}

// function isMoving(actor:Actor, pos:Vec3) {
//     // const event = new ChestBlockActorChangedEvent(chestBlockActor, blockSource);
//     // const cancel = hookEvents.chestBlockChanged.fire(event) === CANCEL;
//     // if (cancel) return;
//     console.log(actor.getName());
//     console.log(pos);
//     return _isMoving(actor, pos);
// }

// const _isMoving = procHacker.hooking("?_moveHitboxTo@Actor@@AEAAXAEBVVec3@@@Z", void_t, null, Actor, Vec3)(isMoving);

export namespace hookEvents {
    export const addTag = new Event<(event: AddTagEvent) => void>();
    export const removeTag = new Event<(event: RemoveTagEvent) => void>();
    export const addItem = new Event<(event: AddItemEvent) => void>();
    export const onChunkLoaded = new Event<(event: ChunkLoadedEvent) => void>();
    export const playerSetArmor = new Event<(event: PlayerSetArmorEvent) => void>();
    export const actuallyHurt = new Event<(event: actuallyHurtEvent) => void>();
    export const onButtonClicked = new Event<(event: ButtonClickedEvent) => void | CANCEL>();
    export const chestBlockChanged = new Event<(event: ChestBlockActorChangedEvent) => void | CANCEL>();
    export const playerTick = new Event<(event: PlayerTickEvent) => void>();
    export const openInventory = new Event<(event: PlayerEvent) => void | CANCEL>();
}
