import express from 'express' 
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import { bugRouter } from './api/bug/bug.route.js'
import { userRoute } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
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
app.use('/api/users', authRoutes)//auth
app.use('/api/users', userRoute)

app.get('/api', (req, res) => res.send('Hello there'));

const port = 3000
app.listen(port, () => loggerService.info(`Server running on port ${port}`))
