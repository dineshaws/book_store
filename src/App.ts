import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import * as ejs from 'ejs';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
let MemoryStore =session.MemoryStore;
import * as flash from 'express-flash-notification';
//import * as flash from 'connect-flash';
//import * as flash from 'req-flash';
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
    this.express.use(cookieParser('keyboard cat'));
    //this.express.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
    this.express.use(session({
        name : 'app.sid',
        secret: "1234567890QWERTY",
        resave: true,
        store: new MemoryStore(),
        saveUninitialized: true
    }));
    this.express.use(flash()); // use connect-flash for flash messages stored in session
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
    router.get('/signup', (req, res) =>  {
      // render the page and pass in any flash data if it exists
      res.render('signup.html');
    });
    router.get('/signin', (req, res)=>  {
      // render the page and pass in any flash data if it exists

      res.render('signin.html');
    });
    router.get('/profile', (req, res)=>  {
      // render the page and pass in any flash data if it exists

      res.render('profile.html');
    });
    router.get('/add_book', (req, res)=>  {
      // render the page and pass in any flash data if it exists

      res.render('add_book.html');
    });

    this.express.use('/', router);
    this.express.use('/api/v1/books', BookRouter);
    this.express.use('/api/v1/users', UserRouter);
  }

}

export default new App().express;
