"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const packageController_1 = require("../controllers/packageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.get('/', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT', 'STUDENT']), packageController_1.getPackages);
router.post('/', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT', 'STUDENT']), packageController_1.createPackage);
router.post('/pay', (0, authMiddleware_1.requireRole)(['STUDENT']), packageController_1.payPackage);
router.patch('/:id/status', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT']), packageController_1.updatePackageStatus);
router.delete('/:id', (0, authMiddleware_1.requireRole)(['ADMIN']), packageController_1.deletePackage);
exports.default = router;
