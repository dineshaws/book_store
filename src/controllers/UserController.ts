import { Request, Response, NextFunction } from 'express';
import * as _ from 'underscore';
import * as async from 'async';
import UserModel from '../models/UserModel';
import AuthModel from '../models/AuthModel';
import UtilHelper from '../helpers/UtilHelper';
import TokenHelper from '../helpers/TokenHelper';

export default class UserController {

    /**
     * Get all
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async getAll(req: Request, res: Response, next: NextFunction) {

        try {

            // 
            // Get data
            let result = await UserModel.find().exec();

            // 
            // Response
            res.send({
                message: 'it works! We got all Users',
                result: result
            });
        } catch (err) {

            // 
            // Error response
            res.send({
                message: 'Could not get Users',
                err: err
            });
        }
    }

    /**
     * signUp
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async signUp(req: Request, res: Response, next: NextFunction) {

        // 
        // Create model
        let newUser = new UserModel();
        newUser.username = req.body.username;
        newUser.email = req.body.email;
        if(req.body.role) {
          newUser.role = req.body.role;
        }
        newUser.password = newUser.generateHash(req.body.password);
        // check email is already exist
        try {
            let isUserExist = await UserModel.findOne({email: req.body.email});
            console.log("isUserExist ",isUserExist)
            if(!isUserExist) {
              try {
                // Save
                await newUser.save();
                console.log('New user successfully created...',req.body.username);
                console.log('email',req.body.email);
                console.log(newUser);
                res.send({
                  message: 'Created!'
                });
              } catch(err) {
                console.log(err);
                res.status(400).json({errMsg: err});
              }
            } else {
              console.log('user already exists');
              res.status(409).json({errMsg: 'email already exists'});
            }
        } catch(e) {
          console.log(e);
          res.status(400).json({errMsg: e});
        } 
    }

    /**
     * Create
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async signIn(req: Request, res: Response, next: NextFunction) {

      if (req.body.email && req.body.password) {
        let email = req.body.email;
        let password = req.body.password;
        try {
          // find user detail from db to check email exist
            let userDetails = await UserModel.findOne({email: email});
            console.log("userDetails ",userDetails)
            if(userDetails) {
              // compare password
              if(userDetails.validPassword(password)) {
                try {
                  //
                  let authDetail = await AuthModel.findOne({user_id: userDetails._id});
                  console.log("authDetail ",authDetail);
                  if(authDetail) {
                    // generate token with existing auth record
                      console.log('Get Auth successfully...',authDetail);
                      let token = TokenHelper.getToken(authDetail);
                      console.log('token.......',token);
                      res.status(200).json({apiStatus: 'success',token: token});
                  } else {
                    // add auth
                    let newAuth = new AuthModel();
                    newAuth.user_id = userDetails._id;
                    try {
                      // Save
                      let auth = await newAuth.save();
                      console.log('New Auth successfully created...',auth);
                      // generate token with new created auth record
                      let token = TokenHelper.getToken(auth);
                      console.log('token...',token);
                      res.status(200).json({apiStatus: 'success',token: token});
                    } catch(err) {
                      console.log(err);
                      res.status(400).json({errMsg: err});
                    }
                  }
                } catch(err) {
                  res.status(400).json({errMsg: err});
                }
                
              } else {
                res.status(403).json({ apiStatus: "Failure", msg: "Invalid password"});
              }
            } else {
              res.status(403).json({ apiStatus: "Failure", msg: "Invalid email"});
            }
        } catch(e) {
          console.log(e);
          res.status(400).json({errMsg: e});
        } 
      }else{
          res.status(403).json({ "apiStatus": "Failure", "msg": "Invalid credentials"});
      }
    }
}