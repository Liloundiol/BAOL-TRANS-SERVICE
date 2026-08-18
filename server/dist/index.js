"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const tripRoutes_1 = __importDefault(require("./src/routes/tripRoutes"));
const reservationRoutes_1 = __importDefault(require("./src/routes/reservationRoutes"));
const busRoutes_1 = __importDefault(require("./src/routes/busRoutes"));
const notificationRoutes_1 = __importDefault(require("./src/routes/notificationRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const financeRoutes_1 = __importDefault(require("./src/routes/financeRoutes"));
const uploadRoutes_1 = __importDefault(require("./src/routes/uploadRoutes"));
const packageRoutes_1 = __importDefault(require("./src/routes/packageRoutes"));
const errorHandler_1 = require("./src/middleware/errorHandler");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'BTS API is running' });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/trips', tripRoutes_1.default);
app.use('/api/reservations', reservationRoutes_1.default);
app.use('/api/buses', busRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/finance', financeRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/packages', packageRoutes_1.default);
// Global Error Handler (must be after all routes)
app.use(errorHandler_1.errorHandler);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
