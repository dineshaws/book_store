import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as flash from 'connect-flash';
import * as ejs from 'ejs';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import BookRouter from './routes/BookRouter';
import UserRouter from './routes/UserRouter';

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.connectToMongo();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(express.static(path.join(__dirname, 'public')));
    this.express.set('views', __dirname + '/views');
    this.express.engine('html', ejs.renderFile);
    this.express.use(flash());
  }

  /**
   * Connect to mongo
   */
  private connectToMongo(): void  {
      console.log("MONGO_URI ",process.env.MONGO_URI)
      // Connect to mongo using mongoose
      // @todo: fix "open()" DeprecationWarning warning
      /*mongoose.connect(process.env.MONGO_URI, {
          db: { safe: true }
      });*/
      mongoose.connect(process.env.MONGO_URI, function(err, db) {
          if (err) {
              console.log('Unable to connect to the server. Please start the server. Error:', err);
          } else {
              console.log('Connected to Server successfully!');
          }
      });

  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    let router = express.Router();
    // placeholder route handler
    router.get('/', (req, res, next) => {
      console.log("hi this is index page");
      //res.sendFile('index.html', { root: __dirname});
      res.render('index.html');
    });
    this.express.use('/', router);
    this.express.use('/api/v1/books', BookRouter);
    this.express.use('/api/v1/users', UserRouter);
  }

}

export default new App().express;
