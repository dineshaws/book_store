import {Router, Request, Response, NextFunction} from 'express';
import BookController from '../controllers/BookController';
import TokenHelper from '../helpers/TokenHelper';
import ValidatorHelper from '../helpers/ValidatorHelper';

export class BookRouter {
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
   		this.router.get('/seed', BookController.seedBooks);
         this.router.post('/add', TokenHelper.validateToken, TokenHelper.hasRole(['editor']), ValidatorHelper.schemaValidate('add','book'), BookController.addBook); // only accessible to editor
         this.router.post('/search', ValidatorHelper.schemaValidate('search','book'), TokenHelper.validateToken, TokenHelper.hasRole(['admin','publisher','author','reader','editor']),  BookController.searchBook);
         this.router.get('/most_searched_book', TokenHelper.validateToken, TokenHelper.hasRole(['admin','publisher','author','reader','editor']),  BookController.mostSearchedBook);
   }

}

// Create the bookRouter object, and export its configured Express.Router
const bookRouter = new BookRouter();
bookRouter.init();
export default bookRouter.router;
