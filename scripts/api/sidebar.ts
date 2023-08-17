import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { RemoveObjectivePacket, ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { ObjectiveSortOrder } from "bdsx/bds/scoreboard";
import { events } from "bdsx/event";

const sidebars = new Map<NetworkIdentifier, Sidebar>();

export type SidebarInfo = ScoreInfo & {
    entry?: ScorePacketInfo;
    strId: string;
};
type ScoreInfo = {
    id: number;
    score: number;
    text: string;
};

export class Sidebar {
    protected elements = new Map<number, SidebarInfo>();
    target: NetworkIdentifier;
    protected displaying = false;
    protected removeOnSet = false;

    constructor(player: ServerPlayer) {
        this.target = player.getNetworkIdentifier();
    }

    setElement(id: number, score: number, text: string, stringId = String(id)): Sidebar {
        if (this.displaying) {
            if (this.removeOnSet) this.removeElement(id);

            const entry = new ScorePacketInfo(true);
            entry.construct();
            entry.scoreboardId.idAsNumber = id;
            entry.objectiveName = "2913:sidebar";
            entry.customName = text;
            entry.type = ScorePacketInfo.Type.FAKE_PLAYER;
            entry.score = score;
            const packet = SetScorePacket.allocate();
            packet.type = SetScorePacket.Type.CHANGE;
            packet.entries.push(entry);
            packet.sendTo(this.target);
            packet.dispose();
            entry.destruct();

            this.elements.set(id, { id, score, text, entry, strId: stringId });
        } else this.elements.set(id, { id, score, text, strId: stringId });

        return this;
    }

    removeElement(id: number): void {
        let entry: ScorePacketInfo | undefined = undefined;
        entry = this.elements.get(id)?.entry;

        this.elements.delete(id);

        if (entry === undefined) return;

        const packet = SetScorePacket.allocate();
        packet.type = SetScorePacket.Type.REMOVE;
        packet.entries.push(entry);
        packet.sendTo(this.target);
        packet.dispose();
    }

    getById(id: number): SidebarInfo | undefined {
        return this.elements.get(id);
    }

    getByScore(score: number): ScoreInfo[] {
        const elements: ScoreInfo[] = [];

        this.elements.forEach((v, id) => {
            if (v.score !== score) return;

            elements.push({
                id,
                score: v.score,
                text: v.text,
            });
        });

        return elements;
    }

    getByStrId(str_id: string): SidebarInfo | undefined {
        let element: SidebarInfo | undefined;

        this.elements.forEach((v, id) => {
            if (v.strId !== str_id) return;

            element = {
                id,
                score: v.score,
                text: v.text,
                strId: v.strId,
            };
        });

        return element;
    }

    getNextId(): number {
        return this.elements.size;
    }

    display(): Sidebar {
        const pkt = SetDisplayObjectivePacket.allocate();
        pkt.displaySlot = "sidebar";
        pkt.objectiveName = "2913:sidebar";
        pkt.displayName = "§f== §9STATE §f==";
        pkt.criteriaName = "dummy";
        pkt.sortOrder = ObjectiveSortOrder.Ascending;

        pkt.sendTo(this.target);
        pkt.dispose();

        this.displaying = true;

        this.elements.forEach((v, id) => {
            this.setElement(id, v.score, v.text);
        });

        this.removeOnSet = true;

        return this;
    }

    static get(player: ServerPlayer): Sidebar {
        const result = sidebars.get(player.getNetworkIdentifier());
        if (!result) {
            const New = new Sidebar(player);
            sidebars.set(player.getNetworkIdentifier(), New);

            return New;
        }

        return result;
    }

    destroy(): void {
        const pkt = RemoveObjectivePacket.allocate();
        pkt.objectiveName = "2913:sidebar";
        pkt.sendTo(this.target);
        pkt.dispose();
    }
}

events.playerLeft.on((ev) => {
    const target = ev.player.getNetworkIdentifier();
    if (sidebars.has(target)) sidebars.delete(target);
});
