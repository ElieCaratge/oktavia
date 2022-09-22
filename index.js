const app = require('./app')

// Constants
const PORT = 8080;
const HOST = '127.0.0.1';

// Server
app.listen(PORT, HOST, () => {
        console.log(`Running on http://${HOST}:${PORT}`);
    })
