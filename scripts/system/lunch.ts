import { Form } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";

const request = require('request');

interface lunch {
    year: string;
    month: number;
    day: number;
    meal: string[];
}

function today(): string {
    const date = new Date();

    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_date = new Date(utc + (KR_TIME_DIFF));

    return `${kr_date.getFullYear()}/${kr_date.getMonth() + 1}/${kr_date.getDate()}`;
}

const dateString = today();

function onLunch(ev: (data: lunch)=> void): void {
    request.get(`https://sntapi.misilelaboratory.xyz/meal/${dateString}`, (error: any, response: Record<string, any>, body: string) => {
        if (error) {
            console.error('Error:', error);
            return;
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
            console.log("no response ok", response.statusCode);
            return;
        } else {
            const js = JSON.parse(body);

            ev(js[0]);
        }
    });
}

export function lunchScreen(player: ServerPlayer) {
    onLunch(async (data)=>{
        await Form.sendTo(player.getNetworkIdentifier(), {
            type: "modal",
            title: `§l급식 ${data.year}/${data.month}/${data.day}`,
            content: `\n§l§f${data.meal.join(" ")}`,
            button1: "§l배고프네",
            button2: "§lㅈ같네"
        });
    });
}
