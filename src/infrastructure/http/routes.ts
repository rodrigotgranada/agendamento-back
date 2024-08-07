import { Router } from 'express';
import { UserController } from '../../interface-adapters/controllers/UserController';

const router = Router();
const userController = new UserController();

router.post('/auth/register', (req, res) => userController.createUser(req, res));

// Outras rotas...

export { router };
