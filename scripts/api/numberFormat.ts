export function numberFormat(x: { toString: () => string }): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function numberToKorean(number: number): string {
    let e = "";
    if (number < 0) {
        number = Math.abs(number);
        e = "-";
    }
    const inputNumber: any = number < 0 ? false : number;
    const unitWords = ["", "만", "억", "조", "경"];
    const splitUnit = 10000;
    const splitCount = unitWords.length;
    const resultArray:number[] = [];
    let resultString = "";

    for (let i = 0; i < splitCount; i++) {
        let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0) {
            resultArray[i] = unitResult;
        }
    }

    for (let i = 0; i < resultArray.length; i++) {
        if (!resultArray[i]) continue;
        resultString = String(numberFormat(resultArray[i])) + unitWords[i] + resultString;
    }
    if (number === 0) resultString = "0";

    return e + resultString;
}

const customFont: Record<number, string> = {
    0: "０",
    1: "１",
    2: "２",
    3: "３",
    4: "４",
    5: "\uff15",
    6: "６",
    7: "７",
    8: "８",
    9: "９",
};
export function numberToCustomFont(number: number): string {
    const nums = String(number).split("");
    let result = "";
    nums.forEach((v) => {
        const num = Number(v);
        if (!isNaN(num) && customFont[num] !== undefined) result += customFont[num];
        else result += v;
    });

    return result;
}
export function convertToRoman(num: number): string {
    const stringified = num.toString();
    const decimal1: any = {
        0: "",
        1: "I",
        2: "II",
        3: "III",
        4: "IV",
        5: "V",
        6: "VI",
        7: "VII",
        8: "VIII",
        9: "IX",
        10: "X",
        11: "XI",
        12: "XII",
        13: "XIII",
        14: "XIV",
        15: "XV",
    } as const;
    const decimal10: any = { 0: "", 10: "X", 20: "XX", 30: "XXX", 40: "XL", 50: "L", 60: "LX", 70: "LXX", 80: "LXXX", 90: "XC" } as const;
    const decimal100: any = { 0: "", 100: "C", 200: "CC", 300: "CCC", 400: "CD", 500: "D", 600: "DC", 700: "DCC", 800: "DCCC", 900: "CM" } as const;
    if (stringified.length === 1) {
        return decimal1[Number(stringified[0])];
    } else if (stringified.length === 2) {
        const d1 = decimal1[Number(stringified[1])];
        const d2 = decimal10[Number(stringified[0]) * 10];
        return d2 + d1;
    } else if (stringified.length === 3) {
        const d1 = decimal1[Number(stringified[2])];
        const d2 = decimal10[Number(stringified[1]) * 10];
        const d3 = decimal100[Number(stringified[0]) * 100];
        return d3 + d2 + d1;
    } else if (stringified.length === 4) {
        const d1 = decimal1[Number(stringified[3])];
        const d2 = decimal10[Number(stringified[2]) * 10];
        const d3 = decimal100[Number(stringified[1]) * 100];
        const d4 = "M".repeat(Number(stringified[0]));
        return d4 + d3 + d2 + d1;
    } else {
        throw Error("too big number");
    }
}

export function toBDSDateFormat(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDay()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const mins = `${date.getMinutes()}`.padStart(2, "0");
    const secs = `${date.getSeconds()}`.padStart(2, "0");
    const milliSecs = `${date.getMilliseconds()}`.padStart(3, "0");
    return `${date.getFullYear()}-${month}-${day} ${hours}:${mins}:${secs}:${milliSecs}`;
}
