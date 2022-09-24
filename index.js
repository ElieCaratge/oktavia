const app = require('./app')

// Constants
const PORT = 8080;
const HOST = '127.0.0.1';
const URL = `http://${HOST}:${PORT}`

// Server
app.listen(PORT, HOST, () => {
        console.log(`Running on ${URL}`);
    })
