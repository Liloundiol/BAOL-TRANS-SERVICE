"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const complaintController_1 = require("../controllers/complaintController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.post('/', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT', 'STUDENT']), complaintController_1.createComplaint);
router.get('/', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT']), complaintController_1.getComplaints);
router.patch('/:id/status', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT']), complaintController_1.updateComplaintStatus);
exports.default = router;
