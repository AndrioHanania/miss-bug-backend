import express from 'express' 
import http from 'http'
import path from 'path'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import { bugRouter } from './api/bug/bug.route.js'
import { userRoute } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { msgRouter } from './api/msg/msg.route.js'
import { loggerService } from './services/logger.service.js'
import { setupSocketAPI } from './services/socket.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express();
const server = http.createServer(app)

app.use(express.json());
app.use(cookieParser())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://localhost:5173'
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}


app.all('*', setupAsyncLocalStorage)

app.use('/api/bugs', bugRouter)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoute)
app.use('/api/msgs', msgRouter)

app.get('/api', (req, res) => res.send('Hello there'));

setupSocketAPI(server)

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => loggerService.info(`Server running on port ${port}`))
