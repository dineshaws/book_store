import { Request, Response, NextFunction } from 'express';
import * as _ from 'underscore';
import * as async from 'async';
import UserModel from '../models/UserModel';
import AuthModel from '../models/AuthModel';
import UtilHelper from '../helpers/UtilHelper';
import TokenHelper from '../helpers/TokenHelper';

export default class UserController {

    /**
     * Get profile
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async profile(req: Request, res: Response, next: NextFunction) {

        try {
            // Get current user profile
            let userInfo = await UserModel.findOne({_id: req.user.user_id},{"_id":0,"email":1, "role":1, "username":1});
            // Response
            res.status(200).json({apiStatus: 'Success', "message": "User profile get successfully", "userInfo":userInfo});
        } catch (err) {
            // Error response
            res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});;
        }
    }

    /**
     * signUp
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async signUp(req: Request, res: Response, next: NextFunction) {

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
            if(!isUserExist) {
              try {
                // Save
                await newUser.save();
                res.status(200).json({"apiStatus": 'Success', "message": "User created successfully"});
              } catch(err) {
                res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});
              }
            } else {
              res.status(409).json({"apiStatus": "Failure", "message": 'Email already exists'});
            }
        } catch(err) {
          res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});;
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
                  if(authDetail) {
                    // generate token with existing auth record
                      console.log('Get Auth successfully...',authDetail);
                      let token = TokenHelper.getToken(authDetail);
                      res.status(200).json({apiStatus: 'Success', "message": "successfully logged in", "token": token});
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
                      res.status(200).json({apiStatus: 'Success', "message": "successfully logged in", "token": token});
                    } catch(err) {
                      res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});;
                    }
                  }
                } catch(err) {
                  res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});
                }
                
              } else {
                res.status(403).json({ "apiStatus": "Failure", "message": "Invalid password"});
              }
            } else {
              res.status(403).json({ "apiStatus": "Failure", "message": "Invalid email"});
            }
        } catch(err) {
          res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});;
        } 
      }else{
          res.status(403).json({ "apiStatus": "Failure", "message": "Invalid credentials"});
      }
    }

    /**
     * Get profile
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    public static async signOut(req: Request, res: Response, next: NextFunction) {

        try {

            // remove token auth info from auth collection
            await AuthModel.remove({_id: req.user._id});
            // Response
            res.status(200).json({apiStatus: 'Success', "message": "User signout successfully"});
        } catch (err) {
            // Error response
            res.status(500).json({"apiStatus": "Failure", "message": "Unexpected error", "error": err});;
        }
    }
}