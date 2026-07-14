import { Router } from 'express';
import { createRescueTeam, getRescueTeams, getRescueTeamById, updateRescueTeam, deleteRescueTeam } from '../controllers/rescueTeam.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', protect, authorize(UserRole.AUTHORITY), createRescueTeam);
router.get('/', protect, authorize(UserRole.RESPONDER, UserRole.AUTHORITY), getRescueTeams);
router.get('/:id', protect, authorize(UserRole.RESPONDER, UserRole.AUTHORITY), getRescueTeamById);
router.patch('/:id', protect, authorize(UserRole.AUTHORITY), updateRescueTeam);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteRescueTeam);

export default router;
