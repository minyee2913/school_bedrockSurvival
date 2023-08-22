import { Actor, DimensionId } from "bdsx/bds/actor";
import { Block, BlockLegacy } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { VectorXYZ } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { bool_t, uint8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

const Block$isMotionBlockingBlock = procHacker.js("?isMotionBlockingBlock@Block@@QEBA_NXZ", bool_t, null, Block);

export function getBottomBlock(actor: Actor): BlockLegacy {
    const blockPos = BlockPos.create(actor.getFeetPos());

    blockPos.y -= 1;

    const region = actor.getRegion();

    const block = region.getBlock(blockPos);

    return block.blockLegacy;
}

export function bottomMotionBlocking(actor: Actor): boolean {
    const pos = actor.getFeetPos();
    const blockPos = BlockPos.create(pos.x, pos.y - 0.3, pos.z);

    return isMotionBlocking(blockPos);
}

export function isMotionBlocking(pos: VectorXYZ): boolean {
    const block = getBlock(pos);
    if (!block) return true;

    const blockName = block.blockLegacy.getCommandName();

    if (
        blockName.includes("glass") ||
        blockName.includes("door") ||
        blockName.includes("iron_bars") ||
        blockName.includes("slab") ||
        blockName.includes("wall") ||
        blockName.includes("fence") ||
        blockName.includes("glass") ||
        blockName.includes("stairs")
    )
        return true;

    const bool = Block$isMotionBlockingBlock(block);

    return bool;
}

export function getBlock(pos: VectorXYZ, dimension?: DimensionId): Block | null {
    const region = bedrockServer.level.getDimension(dimension ?? DimensionId.Overworld)?.getBlockSource();
    if (!region) return null;

    const block = region.getBlock(BlockPos.create(pos.x, pos.y, pos.z));

    return block;
}

export function getFacedBlockPos(blockPos: BlockPos, face: uint8_t): BlockPos {
    const newPos = BlockPos.construct(blockPos);
    switch (face) {
        case 0:
            --newPos.y;
            break;
        case 1:
            ++newPos.y;
            break;
        case 2:
            --newPos.z;
            break;
        case 3:
            ++newPos.z;
            break;
        case 4:
            --newPos.x;
            break;
        case 5:
            ++newPos.x;
            break;
        default:
            return blockPos;
    }
    return newPos;
}
