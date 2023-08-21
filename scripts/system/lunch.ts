import axios from "axios";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

function today(): string {
    const date = new Date();

    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_date = new Date(utc + (KR_TIME_DIFF));

    const formattedDate = `${kr_date.getFullYear()}년 ${String(kr_date.getMonth() + 1).padStart(2, "0")}월 ${String(kr_date.getDate()).padStart(2, "0")}일`;
    const dayOfWeek = daysOfWeek[kr_date.getDay()];
    return `${formattedDate} ${dayOfWeek}요일`;
}

const dateString = today();

(async () =>{
    const data = await axios.get(`https://slunch.ny64.kr/api/meals?date=${dateString}`);
    console.log(data);

})()
