import { getData } from "./api"

export const fetchData = (async () => {
    const { boards, notificationSetting} = await getData();

    return { boards, notificationSetting };
})