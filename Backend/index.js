require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require('axios');
const cron = require('node-cron');
const { createServer } = require("http");
const { Server } = require("socket.io");

global.__basedir = __dirname;

const app = express();
const port = process.env.PORT || 8080;
const url = `http://localhost:${port}`;

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJkYzY4ZjUwZWE4OWNkZjEzMzVmNTYzN2M4ZWQ3ZWFiYiIsInVzZXJJZCI6IjY0ZTZmY2I3MjRjODM5NDNmZTYxMDRjNyIsImNvbXBhbnlJZHMiOlsiYWRpdGFtYSIsInJvb210ZXN0IiwidmljdG9yaW5kbyJdLCJpYXQiOjE3MTY4NjU0MTIsImV4cCI6MTc0ODQyMzAxMn0.bDss__o_nsjp3HNqeWY-C9Zd8JbaoOCYTARaP0Np9B0'
const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`, // Add the Authorization header with the token
      'Content-Type': 'application/json' // Set the Content-Type header to indicate JSON data
    }
};

//Setup Multer
const upload = require("./src/middleware/upload");
const controller = require("./src/controller/file.controller");

//Setup Express
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    connectionStateRecovery: {}, 
    cors : {
        origin: [`http://localhost:3000`],
    }
});

io.on("connection", (socket) => {
    // console.log(socket.id);
    socket.on('updateBoards', data => {
        socket.broadcast.emit('getUpdateBoards', data );
    })
    socket.on('updateBoard', data => {
        socket.broadcast.emit('getUpdateBoard', data );
    })
    socket.on('updateCard', (data) => {
        socket.broadcast.emit('getUpdateCard', data);
    })
    socket.on('leave-board', (board,cb) => {
        socket.leave(board);
        cb(`Leave Room with Id: ${board}`);
    })
    socket.on('join-board', (board, cb) => {
        socket.join(board);
        cb(`Join Room with Id: ${board}`);
    })
});

app.get("/", cors(), (req, res) => {
    res.send("This is Home");
});

app.post("/file", upload.single("file") , controller.uploadFile);

app.delete("/file", controller.deleteFile);

app.get("/files/:name", controller.downloadFile);

async function validToken() {
    try{
        const response = await axios.get( 
            'https://portal.byonchat2.com:37001/v2/auth/check?phonenumber=628975922030&machineId=4f4c8c9401d89ac7'
        )

        if(response){
            const newToken = response.data.accessToken;
            console.log("Response: "+newToken);
            token = newToken;
            return newToken;
        }

    } catch(error) {
        console.log(error);
    }
};

app.get("/token", async (req, res) => {
    const newToken = await validToken();
    if(newToken){
        res.send(newToken);
    }
})

// Function to send email
const sendEmail = (email, subject, text) => {

    // const formData = new FormData();
    // formData.append('userid', 'testing');
    // formData.append('password', '0bai435ubr5tk3654j');
    // formData.append('dest', email);
    // formData.append('subject', subject);
    // formData.append('message', text);

    const createEmail = {
        type: "EMAIL",
        title: subject,
        message: text,
        to: [email],
        isHtml: true,
        files: [],
    };
    
    axios.post("http://172.104.36.61:30007/cmsapi/kanban/notification/send", createEmail, axiosConfig)
    .then(response => {
        console.log('Response: Email berhasil terkirim');
    })
    .catch(error => {
        console.error('Error: ', error);
    });
};

async function fetchDataAndProcess() {
    try {
    
        // Fetch target date from API
        const config = {
            headers: {
            'Authorization': 'Bearer ' + token
            }
        }
        const apiResponse = await axios.get('http://172.104.36.61:30007/cmsapi/kanban/view', config);
        const targetDate = apiResponse.data;

        const listExpired = [];

        // Iterate through boards
        if(targetDate.notificationSetting.email){
            targetDate.boards.forEach(processBoard);
    
            // Process a single board
            function processBoard(board) {
                board.columns.forEach(processColumn.bind(null, board));
            }
    
            // Process a single column
            function processColumn(board, column) {
                column.cards.forEach(processCard.bind(null, board, column));
            }
    
            // Process a single card
            function processCard(board, column, card) {
                card.checklist.forEach(processChecklist.bind(null, board, column, card));
            }
    
            // Process a single checklist item
            function processChecklist(board, column, card, list) {
                if (list.date !== null && list.member !== null) {
                    const dateList = new Date(list.date);
                    const threeDayBefore = new Date();
                    threeDayBefore.setDate(dateList.getDate() - 3);
                    const dateNow = new Date();

                    // Convert dates to milliseconds since Unix Epoch
                    const millisecondsNow = dateNow.getTime();
                    const millisecondsList = dateList.getTime();
                    
                    if(!list.check){
                        if(isSameDate(dateNow, dateList)){
                            const newEmail = {
                                name: list.member.name,
                                email: 'carolusboromeus05@gmail.com',
                                board: board.title,
                                column: column.title,
                                card: card.title,
                                list: list.list,
                                note: 'expired soon'
                            }
                            listExpired.push(newEmail);
                        } else if (isSameDate(dateNow, threeDayBefore)) {
                            
                            const newEmail = {
                                name: list.member.name,
                                email: 'carolusboromeus05@gmail.com',
                                board: board.title,
                                column: column.title,
                                card: card.title,
                                list: list.list,
                                note: 'three days expired'
                            }
                            listExpired.push(newEmail);
                        } else if(millisecondsNow > millisecondsList){
                            const newEmail = {
                                name: list.member.name,
                                email: 'carolusboromeus05@gmail.com',
                                board: board.title,
                                column: column.title,
                                card: card.title,
                                list: list.list,
                                note: 'expired task'
                            }
                            listExpired.push(newEmail);
                        }
                    }
                    
                }
            }

            // Function to check if two dates are the same (ignoring time)
            function isSameDate(date1, date2) {
                return date1.toDateString() === date2.toDateString();
            }

            if(listExpired.length > 0){
                templateEmail(listExpired);
            }
        } else if(!targetDate){
            const response = await validToken();
            if(response){
                console.log("New Token: "+response);
                await fetchDataAndProcess();
            }
        } else {
            console.log("Configuration Notification: Tidak Ada");
        }

    } catch (error) {
        console.log('Error fetching data from API:', error);
        setTimeout(fetchDataAndProcess, 60000); // Retry after 1 minute
    }
}

function templateEmail(listExpired) {
    // Group the listExpired array by email addresses
    const groupedByEmail = {};
    listExpired.forEach(item => {
        if (!groupedByEmail[item.email]) {
            groupedByEmail[item.email] = [];
        }
        groupedByEmail[item.email].push(item);
    });

    // Loop through the grouped emails and send an email to each group
    Object.keys(groupedByEmail).forEach(email => {
        const items = groupedByEmail[email];
        
        // Compose email body
        let emailBody = `<html><body><h2>Task Reminder</h2><br><p>Hi <b>${items[0].name}</b>,</p>`;

        emailBody += '<p>the following tasks either expire within the three days, expire in the coming days or have already expired</p>';
        let first = true;
        items.forEach((item) => {
            if(item.note === 'expired task'){
                if(first) {
                    emailBody += '<h3>Expired task</h3><ul>';
                    first = false;
                }
                emailBody += `<li>Task: <b>${item.list}</b><br>On the card <b>${item.card}</b>, in the column <b>${item.column}</b>, and on the board named <b>${item.board}</b></li>`
            }
        });
        if(!first){
            emailBody += '</ul>';
            emailBody += '<hr>';
        }

        first = true
        items.forEach((item) => {
            if(item.note === 'expired soon'){
                if(first){
                    emailBody += '<h3>Shortly expiring task</h3><ul>';
                    first = false;
                }
                emailBody += `<li>Task: <b>${item.list}</b><br>On the card <b>${item.card}</b>, in the column <b>${item.column}</b>, and on the board named <b>${item.board}</b></li>`
            }
        });
        if(!first){
            emailBody += '</ul>';
            emailBody += '<hr>';
        }

        first = true
        items.forEach((item) => {
            if(item.note === 'three days expired'){
                if(first){
                    emailBody += '<h3>Task expiring within the next 3 days</h3><ul>';
                    first = false;
                }
                emailBody += `<li>Task: <b>${item.list}</b><br>On the card <b>${item.card}</b>, in the column <b>${item.column}</b>, and on the board named <b>${item.board}</b></li>`
            }
        });
        if(!first){
            emailBody += '</ul>';
        }

        emailBody += '</body></html>';

        const subject = 'Task List Reminder!';
        sendEmail(email, subject, emailBody);
    });
}
  
// Schedule email sending based on date from API
cron.schedule('0 0 * * *', async () => {
    await fetchDataAndProcess();
});

httpServer.listen(port, () => {
    console.log(`Server Listening at ${url}`);
});