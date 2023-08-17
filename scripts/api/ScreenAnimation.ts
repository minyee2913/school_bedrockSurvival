import { MobEffectIds } from "bdsx/bds/effects";
import { OnScreenTextureAnimationPacket } from "bdsx/bds/packets";
import { Player } from "bdsx/bds/player";

export function showScreenAnimation(actor: Player, animationType: MobEffectIds): void {
    const pkt = OnScreenTextureAnimationPacket.allocate();
    pkt.animationType = animationType;
    actor.sendNetworkPacket(pkt);
    pkt.dispose();
}
