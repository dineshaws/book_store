import {Router, Request, Response, NextFunction} from 'express';
import UserController from '../controllers/UserController';
import ValidatorHelper from '../helpers/ValidatorHelper';

export class UserRouter {
	router:Router;

	/**
   * Initialize the SampleRouter
   */
	constructor() {
		this.router = Router();
		this.init();
	}

	/**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
   init() {
   		this.router.post('/signup', ValidatorHelper.schemaValidate('signup','user'), UserController.signUp);
         this.router.post('/signin', ValidatorHelper.schemaValidate('signin','user'), UserController.signIn);
   }

}

// Create the userRouter object, and export its configured Express.Router
const userRouter = new UserRouter();
userRouter.init();
export default userRouter.router;
