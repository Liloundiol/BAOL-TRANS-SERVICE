"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = express_1.default.Router();
router.get('/reset-admins', userController_1.resetAdmins);
// Only ADMIN can manage users
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.requireRole)(['ADMIN']));
router.route('/')
    .get((0, cacheMiddleware_1.cacheMiddleware)(60), userController_1.getUsers)
    .post((req, res, next) => { (0, cacheMiddleware_1.clearCache)('/users'); next(); }, userController_1.createUser);
router.route('/:id')
    .put((req, res, next) => { (0, cacheMiddleware_1.clearCache)('/users'); next(); }, userController_1.updateUser)
    .delete((req, res, next) => { (0, cacheMiddleware_1.clearCache)('/users'); next(); }, userController_1.deleteUser);
exports.default = router;
