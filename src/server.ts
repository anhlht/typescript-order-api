// import * as fs from 'fs' 
// import * as https from 'https'
import app from './app'

const PORT = process.env.PORT

// const httpsOptions = {
//     key: fs.readFileSync('./key.pem'),
//     cert: fs.readFileSync('./cert.pem'),
// }

// https.createServer(httpsOptions, app).listen(PORT)

app.listen(PORT)