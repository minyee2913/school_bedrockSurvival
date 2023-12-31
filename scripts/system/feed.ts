import { ServerPlayer } from "bdsx/bds/player";
import { Database } from "../api/database";
import { Form } from "bdsx/bds/form";
import { v4 as uuidv4 } from "uuid";
import { bedrockServer } from "bdsx/launcher";
import _ = require("lodash");

interface Comment {
    writer: string;
    text: string;
}

class Feed extends Database.tableClass {
    @Database.field(Database.TEXT)
    uuid: string;

    @Database.field(Database.TEXT)
    author: string;

    @Database.field(Database.TEXT)
    title: string;

    @Database.field(Database.TEXT)
    context: string;

    @Database.field(Database.JSON_TEXT)
    comment: Comment[] = [];
}

const db = Database.connect("./feeds");
const feeds = db.createTable(Feed, true);

export async function FeedScreen(player: ServerPlayer) {
    const buttons: {text: string, uuid: string; }[] = [];

    const feds = feeds.values();
    if (feds.length > 60) feds.length = 60;

    feds.forEach((v)=>{
        buttons.unshift({
            text: v.title + "\n§7" + v.author,
            uuid: v.uuid,
        });
    });

    buttons.unshift(
        {
            text: "§3작성하기",
            uuid: "write",
        }
    );

    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: "§l피드",
        content: "하고싶은거 맘대로 해봐 ㅋㅋ",
        buttons: buttons,
    });

    if (result === null) return;

    if (result === 0) return writeFeed(player);

    const select = buttons[result];
    if (!select) return;

    onFeed(player, select.uuid);
}

export async function writeFeed(player: ServerPlayer): Promise<void> {
    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "custom_form",
        title: "§l피드 작성",
        content: [
            {
                type: "input",
                placeholder: "입력하세요.",
                text: "제목",
            },
            {
                type: "input",
                placeholder: "입력하세요.",
                text: "내용 ( \n으로 줄바꿈, $pos로 현재 좌표 입력 )",
            },
        ],
    });

    if (result === null) return FeedScreen(player);

    const [title, context] = result;
    if (title === "" || context === "") {
        player.sendMessage("§c공백? 장난해?");

        writeFeed(player);
        return;
    }

    const data = new Feed();
    data.author = player.getName();
    data.context = context;
    data.title = title;
    data.uuid = uuidv4();

    feeds.insert(data);

    player.sendMessage("§a작성완료!");
    player.runCommand("playsound random.levelup @s ~ ~ ~");

    _(bedrockServer.level.getPlayers()).forEach((p)=>{
        p.sendToastRequest("§a피드가 올라왔습니다.", `§f${data.title}`);
    });

    FeedScreen(player);
}

export async function onFeed(player: ServerPlayer, uuid: string): Promise<void> {
    const feed = feeds.get({uuid: uuid});
    if (!feed) return;

    const pos = player.getFeetPos();

    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: "§l" + feed.title,
        content: `§7작성자: ${feed.author}\n\n${feed.context.replace(/\\n/gi, "\n").replace(/\$pos/gi, `${pos.x} ${pos.y} ${pos.z}`)}\n\n§l`,
        buttons: [
            {
                text: `§l댓글 보기 §a[${feed.comment.length}]`,
            },
            {
                text: `§l댓글 쓰기`,
            },
            {
                text: "§l돌아가기",
            }
        ],
    });

    if (result === null || result === 2) return FeedScreen(player);

    if (result === 1) return writeComment(player, uuid);

    feedComment(player, uuid);
}

export async function writeComment(player: ServerPlayer, uuid: string): Promise<void> {
    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "custom_form",
        title: "§l댓글 작성",
        content: [
            {
                type: "input",
                placeholder: "입력하세요.",
                text: "내용 ( \n으로 줄바꿈, $pos로 현재 좌표 입력 )",
            },
        ],
    });

    if (result === null) return onFeed(player, uuid);

    const [comment] = result;
    if (comment === "") {
        player.sendMessage("§c공백? 장난해?");

        writeComment(player, uuid);
        return;
    }

    const feed = feeds.get({uuid: uuid});
    if (!feed) return;

    const pos = player.getFeetPos();

    feed.comment.unshift(
        {
            writer: player.getName(),
            text: comment.replace(/\\n/gi, "\n").replace(/\$pos/gi, `${pos.x} ${pos.y} ${pos.z}`),
        }
    )

    player.sendMessage("§6작성완료!");
    player.runCommand("playsound random.levelup @s ~ ~ ~");

    feeds.update({comment: feed.comment}, {uuid: feed.uuid});

    onFeed(player, uuid);
}

export async function feedComment(player: ServerPlayer, uuid: string): Promise<void> {
    const feed = feeds.get({uuid: uuid});
    if (!feed) return;

    const comments:string[] = [];

    feed.comment.forEach((v)=>{
        comments.push(`§9${v.writer}§f: ${v.text}`);
    });

    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: "§l" + feed.title + " 댓글",
        content: `§l${comments.join("\n")}`,
        buttons: [],
    });

    if (result === null) return onFeed(player, uuid);
}
