import axios from "axios";

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJkYzY4ZjUwZWE4OWNkZjEzMzVmNTYzN2M4ZWQ3ZWFiYiIsInVzZXJJZCI6IjY0ZTZmY2I3MjRjODM5NDNmZTYxMDRjNyIsImNvbXBhbnlJZHMiOlsiYWRpdGFtYSIsInJvb210ZXN0IiwidmljdG9yaW5kbyJdLCJpYXQiOjE3MTY4NjU0MTIsImV4cCI6MTc0ODQyMzAxMn0.bDss__o_nsjp3HNqeWY-C9Zd8JbaoOCYTARaP0Np9B0';
// const urlNode = 'http://dmdev.byonchat2.com:6969';
export const urlNode = 'http://localhost:8080';
export const urlFile = `${urlNode}/files/`;

export const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`, // Add the Authorization header with the token
      'Content-Type': 'application/json' // Set the Content-Type header to indicate JSON data
    }
};

export const postData = (async (newBoard, notification) => {
    const data = {
        boards: newBoard,
        notificationSetting: notification
    }

    try{
        await axios.post("http://172.104.36.61:30007/cmsapi/kanban/view", data, axiosConfig);
    } catch (error) {
        console.log(error);
    }

});

export const getData = (async () => {
    let data = {};
    try{
        const response = await axios.get("http://172.104.36.61:30007/cmsapi/kanban/view", axiosConfig);
        if(response.data){
            data = response.data;
            const boards = data.boards;
            const notificationSetting = data.notificationSetting;
            return {boards, notificationSetting};
        } 
        else if(!response.data){
            try{
                const response = await axios.get(`${urlNode}/token`);
                if(response.data){
                    console.log("New Token: "+response.data);
                    token = response.data;
                }
            } catch (error) {
                console.log(error);
            }
        }
        
    } catch (error) {
        console.log(error);
    }
});

export const getNotificationLog = (async (pageNumber) => {
    try{
        const res = await axios.get(`http://172.104.36.61:30007/cmsapi/kanban/notification/log?pageNumber=${pageNumber}&type=EMAIL`, axiosConfig);
        return res.data;
    } catch (error) {
        console.log(error);
    }
});

export const getMember = (async () => {
    try{
        const res = await axios.get("http://172.104.36.61:30007/cmsapi/kanban/users", axiosConfig)
        return res.data;
    } catch (error) {
        console.log(error);
    }
});

export const deleteFile = (async (newFile) => {
    try{
        await axios.delete(`${urlNode}/file`, {
            data: {newFile: newFile}
        })
        
    } catch (error) {
        console.log(error);
    }
})

export const postFile = (async (formData) => {
    try{
        const response = await axios.post(`${urlNode}/file`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if(response){
            return response;
        }

    } catch (error) {
        console.log(error);
    }
})