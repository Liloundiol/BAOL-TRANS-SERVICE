"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripController_1 = require("../controllers/tripController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Routes
router.get('/', tripController_1.getTrips);
router.get('/:id', tripController_1.getTripById);
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), tripController_1.createTrip);
router.put('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), tripController_1.updateTrip);
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), tripController_1.deleteTrip);
exports.default = router;
