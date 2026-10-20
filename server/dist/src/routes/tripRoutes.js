"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripController_1 = require("../controllers/tripController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
// Routes
// Cache trips for 10 seconds (short cache since availability changes fast)
router.get('/', (0, cacheMiddleware_1.cacheMiddleware)(10), tripController_1.getTrips);
router.get('/:id', tripController_1.getTripById);
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), (req, res, next) => { (0, cacheMiddleware_1.clearCache)('/trips'); next(); }, tripController_1.createTrip);
router.put('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), (req, res, next) => { (0, cacheMiddleware_1.clearCache)('/trips'); next(); }, tripController_1.updateTrip);
router.patch('/:id/toggle-status', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), (req, res, next) => { (0, cacheMiddleware_1.clearCache)('/trips'); next(); }, tripController_1.toggleTripStatus);
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['ADMIN']), (req, res, next) => { (0, cacheMiddleware_1.clearCache)('/trips'); next(); }, tripController_1.deleteTrip);
exports.default = router;
