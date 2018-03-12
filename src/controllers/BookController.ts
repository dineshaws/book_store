import { Request, Response, NextFunction } from 'express';
import * as redis from 'redis';
import * as moment from 'moment';
import * as _ from 'underscore';
import BookModel from '../models/BookModel';
import UtilHelper from '../helpers/UtilHelper';
let client = redis.createClient({port: process.env.REDIS_PORT, host: process.env.REDIS_HOST});

//function to create sorted set redis Search List key name
let redisKeyForSearchList = function() {
    return `BookSearchList`;
}
export default class BookController {

    public static mostSearchedBook(req: Request, res: Response, next: NextFunction) {
      // redis caching for most searched book in a week by redis sorted sets
      const redisSearchListKey = redisKeyForSearchList();
      const min = moment().day(-7).utc().format('x');  // last Sunday (0 - 7)
      const max = moment().day(0).utc().format('x');
      //console.log("min ",min, " max ",max);
      client.zrangebyscore(redisSearchListKey, min, max, function(err, data) {
        if(err) {
          // Error response
          res.status(500).json({"status":"failure", "message":"Error while fetching data", "err":err});
        } else {
          let booksAgg = _.groupBy(data, function(item){ 
            let arrBook = item.split(":");
            if(arrBook[0]) {
              let bookTitle = arrBook[0];
              return bookTitle;
            }
          });
          var finalBooks = [];
          for (var key in booksAgg) {
              if (booksAgg.hasOwnProperty(key)) {           
                  finalBooks.push({"title":key, "search_time":booksAgg[key].length});
              }
          }
          //console.log("finalBooks ",finalBooks);
          finalBooks = _.sortBy(finalBooks, 'search_time');
          res.status(200).json({"status":"success", "message":"Got most searched books successfully", "books":finalBooks});
        }
      });
    }

    /**
     * search book
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async searchBook(req: Request, res: Response, next: NextFunction) {
        try {
            // Get data
            let condition = {};
            if(req.body.search_key && req.body.search_by) {
              if(req.body.search_by === 'isbn_10' || req.body.search_by === 'isbn_13') {
                condition["isbn."+req.body.search_by] = req.body.search_key;
              } else if(req.body.search_by === 'authors' || req.body.search_by === 'categories') {
                condition[req.body.search_by] = {$elemMatch:{$eq:req.body.search_key}};
              } else {
                condition[req.body.search_by] = req.body.search_key;
              }
              
            } 
            // redis caching for most searched book in a week by redis sorted sets
            const redisSearchListKey = redisKeyForSearchList();
            const ts = UtilHelper.getTimestamp();
            let result = await BookModel.find(condition).exec();
            var bookRedisArr = new Array();  // for redis sorted set
            //Adding first value as redis key. first value define the key name of sorted set 
            bookRedisArr.push(redisSearchListKey);
            _.each(result, (item) =>{ 
                bookRedisArr.push(ts); // adding ts as score for sorted set
                let localVal = item.title+":"+ts; // combo of title and timestamp to make it unique
                bookRedisArr.push(localVal); // adding book title as member for sorted set
            })
            try {
              if(bookRedisArr.length > 1) {
                await client.zadd(bookRedisArr)//[key, score, member]
              }
              // Response
              res.status(200).json({"apiStatus":"Success", "message":"Got books successfully", "books":result});
            } catch(err) {
              // Error response
              res.status(500).json({"apiStatus":"Failure", "message":"Error while zadd data", "err":err});
            }
            
        } catch (err) {
            // Error response
            res.status(500).json({"apiStatus":"Failure", "message":"Error while fetching data", "err":err});
        }
    }

    /**
     * addBook 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async addBook(req: Request, res: Response, next: NextFunction) {

        // create object
        let tempObj = new Object();
        tempObj['id'] = req.body.id;
        tempObj['title'] = req.body.title;
        tempObj['subtitle'] = req.body.subtitle;
        tempObj['authors'] = req.body.authors;
        tempObj['categories'] = req.body.categories;
        tempObj['publisher'] = req.body.publisher;
        tempObj['publishedDate'] = req.body.publishedDate;
        tempObj['description'] = req.body.description;
        tempObj['isbn'] = {};
        if(req.body.hasOwnProperty('isbn_10')) {
            tempObj['isbn']['isbn_10'] = req.body.isbn_10;
        }
        if(req.body.hasOwnProperty('isbn_13')) {
            tempObj['isbn']['isbn_13'] = req.body.isbn_13;
        }
        tempObj['cover'] = req.body.cover;
        tempObj['seed_type'] = req.body.seed_type || 'api';
        // Create model
        let bookModel = new BookModel(tempObj);
        // Save
        try {
          await bookModel.save();
          res.status(201).send({"apiStatus":"Success", "message": 'Book Added!'});
        } catch(err) {
          res.status(500).json({"apiStatus":"Failure", "message":"Error while save data", "err":err});
        }
    }

    /**
     * seedBooks
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async seedBooks(req: Request, res: Response, next: NextFunction) {
        const _this = this;
        const url = process.env.BOOK_SEED_API || '';
        if(url) {
            try{
              const response = await fetch(url);
              const json = await response.json();
              //find random 20 records from array
              let randomBooks = UtilHelper.getRandomArrayElements(json.items, 20);
              let finalBooks = new Array();
              _.each(randomBooks, (item) =>{ 
                let tempObj = new Object();
                if(item.hasOwnProperty('volumeInfo')) {
                  //console.log("item ",JSON.stringify(item));
                  tempObj['id'] = item.id;
                  tempObj['title'] = item.volumeInfo.title;
                  tempObj['subtitle'] = item.volumeInfo.subtitle;
                  tempObj['authors'] = item.volumeInfo.authors;
                  tempObj['categories'] = item.volumeInfo.categories;
                  tempObj['publisher'] = item.volumeInfo.publisher;
                  tempObj['publishedDate'] = item.volumeInfo.publishedDate;
                  tempObj['description'] = item.volumeInfo.description;
                  if(item.volumeInfo.hasOwnProperty('industryIdentifiers')) {
                      tempObj['isbn'] = {};
                      _.each(item.volumeInfo.industryIdentifiers, (isbn) =>{ 
                          if(isbn.type == 'ISBN_10') {
                              tempObj['isbn']['isbn_10'] = isbn.identifier;
                          } else if(isbn.type == 'ISBN_13') {
                              tempObj['isbn']['isbn_13'] = isbn.identifier;
                          }
                      })
                  }
                  tempObj['cover'] = item.volumeInfo.previewLink;
                  tempObj['seed_type'] = 'seed';
                  finalBooks.push(tempObj);
                }
              });
              // save records in one shot using insertMany, mongodb version 3.6+ compatible
              await BookModel.insertMany(finalBooks); 

              res.status(201).send({"apiStatus":"Success", "message": 'Created!'});

            } catch(err) {
              res.status(500).json({"apiStatus":"Failure", "message":"Error while fetch api records", "err":err});
            }
        } else {
            res.status(404).json({"apiStatus":"Failure", "message":"Seed End Point not exist"});
        }
    }
}