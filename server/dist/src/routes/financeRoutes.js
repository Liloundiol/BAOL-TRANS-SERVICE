"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financeController_1 = require("../controllers/financeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Only ADMIN can access finance data
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.requireRole)(['ADMIN']));
router.get('/stats', financeController_1.getFinanceStats);
router.get('/payments', financeController_1.getRecentPayments);
exports.default = router;
