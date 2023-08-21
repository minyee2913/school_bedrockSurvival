import { Form } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";

const request = require('request');

interface timetable {
    grade: number;
    class: number;
    weekday: number;
    weekdayString: string;
    classTime: number;
    teacher: number;
    subject: string;
}

function today(): string {
    const date = new Date();

    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_date = new Date(utc + (KR_TIME_DIFF));

    return `${kr_date.getFullYear()}/${kr_date.getMonth() + 1}/${kr_date.getDate()}`;
}

const classList:string[] = [];

request.get(`https://slunch.ny64.kr/api/timetable/classList`, (error: any, response: Record<string, any>, body: string) => {
    if (error) {
        console.error('Error:', error);
        return;
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
        console.log("no response ok", response.statusCode);
        return;
    } else {
        const js = JSON.parse(body);

        classList.push(...js);
    }
});

const dateString = today();

function onTimetable(class_: string, ev: (data: timetable[])=> void): void {
    const clsSplit = class_.split("-");
    request.get(`https://slunch.ny64.kr/api/timetable/${clsSplit[0]}/${clsSplit[1]}`, (error: any, response: Record<string, any>, body: string) => {
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

export async function timeScreen(player: ServerPlayer) {
    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "custom_form",
        title: `§l반을 선택하세요.`,
        content: [
            {
                type: "dropdown",
                text: "학년-반",
                options: [
                    "<선택하세요>",
                    ...classList,
                ],
                default: 0,
            }
        ],
    });

    if (result === null) return;

    const [drop] = result;

    const select = classList[drop - 1];
    onTimetable(select, async (data)=>{
        const timeTable = new Map<number, string>();

        data.forEach((v)=>{
            const f = timeTable.get(v.class);
            let str = [" ", " ", " ", " "];
            for (let i = 0; i < v.subject.length; i++) {
                str[i] = v.subject[i];
            }

            if (f) {
                timeTable.set(v.class, f + str.join(""));
            } else {
                timeTable.set(v.class, str.join(""));
            }
        });



        await Form.sendTo(player.getNetworkIdentifier(), {
            type: "form",
            title: `§l${select} 시간표`,
            content: `${Array.from(timeTable.entries()).join("\n")}`,
            buttons: [],
        });
    });
}
