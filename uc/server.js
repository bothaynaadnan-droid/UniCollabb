require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const socketIO = require('socket.io');
const morgan = require('morgan');
const db = require('./config/DB');
const { authenticate } = require('./middleware/auth');
const { globalErrorHandler, AppError } = require('./middleware/errorhandler');

const app = express();


process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    process.exit(1);
});



app.use(cors({
    origin: [
        'http://localhost:3000',     
        'http://localhost:3001', 
        'http://localhost:3002',  
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    req.requestTime = new Date().toISOString();
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const path = require('path');
const fs = require('fs');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ],
        credentials: true
    }
});


io.on('connection', (socket) => {
    console.log(' User connected:', socket.id);
    

    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });
    

    socket.on('send_message', async (data) => {
        try {
            const Message = require('./models/MessagesModel');
            const message = await Message.create(data);
            io.to(`conversation_${data.conversation_id}`).emit('new_message', message);
        } catch (error) {
            console.error('Socket message error:', error);
            socket.emit('message_error', { error: error.message });
        }
    });
    

    socket.on('typing', (data) => {
        socket.to(`conversation_${data.conversation_id}`).emit('user_typing', {
            userId: data.userId,
            userName: data.userName
        });
    });
    

    socket.on('stop_typing', (data) => {
        socket.to(`conversation_${data.conversation_id}`).emit('user_stop_typing', {
            userId: data.userId
        });
    });
    

    socket.on('disconnect', () => {
        console.log(' User disconnected:', socket.id);
    });
});


app.set('io', io);



const userRoute = require('./routes/userRoute');
const studentRoute = require('./routes/studentRoute');
const supervisorRoute = require('./routes/supervisorRoute');
const projectRoute = require('./routes/projectRoute');
const projectMemberRoute = require('./routes/projectMemberRoute');
const projectFeedbackRoute = require('./routes/projectFeedbackRoute');
const joinRequestRoute = require('./routes/joinRequestRoute');
const supervisorRequestRoute = require('./routes/supervisorRequestRoute');
const plannerRoute = require('./routes/plannerRoute');
const conversationRoute = require('./routes/conversationRoute');
const conversationMemberRoute = require('./routes/conversationMemberRoute');
const messageRoute = require('./routes/messageRoute');

console.log(' Routes imported successfully');



app.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT 1");
        res.json({ 
            success: true,
            message: ' UniCollab API Server is running!',
            database: 'Connected successfully!',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'UniCollab API is operational',
        endpoints: {
            users: '/api/user',
            students: '/api/student',
            supervisors: '/api/supervisor',
            projects: '/api/project',
            projectMembers: '/api/project-member',
            projectFeedback: '/api/project-feedback',
            conversations: '/api/conversation',
            conversationMembers: '/api/conversation-member',
            messages: '/api/message'
        },
        timestamp: new Date().toISOString()
    });
});



const UserController = require('./controllers/UserController');


app.post('/api/user/register', UserController.create);
app.post('/api/user/login', UserController.login);
app.post('/api/user/refresh-token', UserController.refreshToken);
app.post('/api/user/forgot-password', UserController.forgotPassword);
app.post('/api/user/reset-password', UserController.resetPassword);
app.get('/api/user/verify-email', UserController.verifyEmail);
app.post('/api/user/resend-verification', UserController.resendVerification);


app.use('/api/user', authenticate, userRoute);
app.use('/api/student', authenticate, studentRoute);
app.use('/api/supervisor', authenticate, supervisorRoute);
app.use('/api/project', authenticate, projectRoute);
app.use('/api/project-member', authenticate, projectMemberRoute);
app.use('/api/project-feedback', authenticate, projectFeedbackRoute);
app.use('/api/join-request', authenticate, joinRequestRoute);
app.use('/api/supervisor-request', authenticate, supervisorRequestRoute);
app.use('/api/planner', authenticate, plannerRoute);
app.use('/api/conversation', authenticate, conversationRoute);
app.use('/api/conversation-member', authenticate, conversationMemberRoute);
app.use('/api/message', authenticate, messageRoute);

console.log(' All routes registered');


app.use(require('./middleware/upload').handleMulterError);



const clientBuildPath = path.join(__dirname, 'uni', 'build');
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}


app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});


app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
    console.log(`
    ═══════════════════════════════════════════════════════
        UniCollab Server Started Successfully!
    ═══════════════════════════════════════════════════════
        Server URL:        http://${HOST}:${PORT}
        Environment:       ${process.env.NODE_ENV || 'development'}
        Socket.IO:         Enabled
        Authentication:    Enabled (except /register & /login)
        Started at:        ${new Date().toISOString()}
    ═══════════════════════════════════════════════════════
    Available Endpoints:
    
    PUBLIC (No Auth):
    ├─ Health Check:      GET  /
    ├─ API Status:        GET  /api/status
    ├─ Register:          POST /api/user/register
    └─ Login:             POST /api/user/login
    
    PROTECTED (Auth Required):
    ├─ Users:             /api/user
    ├─ Students:          /api/student
    ├─ Supervisors:       /api/supervisor
    ├─ Projects:          /api/project
    ├─ Project Members:   /api/project-member
    ├─ Project Feedback:  /api/project-feedback
    ├─ Conversations:     /api/conversation
    ├─ Conv. Members:     /api/conversation-member
    └─ Messages:          /api/message
    ═══════════════════════════════════════════════════════
    `);
});


process.on('SIGINT', () => {
    console.log('\n SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log(' Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log(' Server closed successfully');
        process.exit(0);
    });
});

module.exports = app;