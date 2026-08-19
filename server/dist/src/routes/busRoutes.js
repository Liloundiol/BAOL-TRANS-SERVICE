"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busController_1 = require("../controllers/busController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Toutes les routes de bus nécessitent une authentification
router.use(authMiddleware_1.authenticateToken);
router.get('/all', (0, authMiddleware_1.requireRole)(['ADMIN', 'AGENT']), busController_1.getAllBuses);
router.post('/', (0, authMiddleware_1.requireRole)(['ADMIN']), busController_1.createBus);
router.put('/:id', (0, authMiddleware_1.requireRole)(['ADMIN']), busController_1.updateBus);
router.delete('/:id', (0, authMiddleware_1.requireRole)(['ADMIN']), busController_1.deleteBus);
exports.default = router;
