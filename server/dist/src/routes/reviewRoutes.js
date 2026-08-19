"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Routes publiques
router.get('/', reviewController_1.getLatestReviews);
// Routes clients
router.post('/', authMiddleware_1.authenticateToken, reviewController_1.createReview);
// Routes admin
router.get('/admin', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), reviewController_1.getAdminReviews);
router.patch('/:id/publish', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), reviewController_1.publishReview);
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), reviewController_1.deleteReview);
exports.default = router;
