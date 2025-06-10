import express from 'express'
import UserController from '../Controllers/userController.js'
import protectRoute from '../Middlewares/protection.js'

const router = express.Router();

router.use(protectRoute);

router.get('/all-users', UserController.getAllUsers)
router.patch('/update-user', UserController.updateUserData);
router.delete('/delete-user', UserController.deleteUserData);
router.patch("/update-password", UserController.updatePassword);


export default router;