import express from 'express' 
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { bugRouter } from './routes/bug.controller.js'
import { loggerService } from './services/logger.service.js'

const app = express();
const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true
};

app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser())

app.use('/api/bugs', bugRouter)

app.get('/api', (req, res) => res.send('Hello there'));

const port = 3000
app.listen(port, () => loggerService.info(`Server running on port ${port}`))
