import * as jwt from 'jsonwebtoken';
import * as url from 'url';

import AuthModel from '../models/AuthModel';
import UserModel from '../models/UserModel';

export default class TokenHelper {

	/**
     * Sync Function to generate token
     * @param {*} auth object
     */
	public static getToken(auth) {
		//Generate secret token
	    let token = jwt.sign(
	        {   id : auth._id,
	            user_id: auth.user_id
	        },
	        process.env.SECRETTOKEN
	    );
	    return token;
	}

	/**
     * Middleware to validate token 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
	public static async validateToken(req, res, next) {
	    let parsed_url = url.parse(req.url, true);
	    let token = (req.body && req.body.access_token) || parsed_url.query.access_token || req.headers["x-access-token"] || req.headers["access-token"]; // access_token header added for supplier api v2
	    if (token) {
    		try {
	    	    let decoded = jwt.verify(token, process.env.SECRETTOKEN);
	    	    let authDetail = await AuthModel.findOne({user_id: decoded.user_id});
                  console.log("authDetail ",authDetail);
                  if(authDetail) {
                    req.user = authDetail
                    return next();
                  } else {
                    console.log("user does not exist");
                    return res.status(401).json({message: "Invalid access token"});
                  }
	    	} catch(err) {
	    		console.log("jwt.decode failed" , err);
                return res.status(401).json({message: "Invalid access token"});
	    	}
	    } else {
	        console.log("token is empty");
	        return res.status(401).json({message: "Missing access token"});
	    }
	}

	public static hasRole(roles) {
		return async function(req, res, next) {
		    try {
	            let userData = await UserModel.findOne({_id: req.user.user_id});
	            if(userData) {
	                if(roles && Array.isArray(roles) && roles.length > 0) {
		                let accessAllowed = false;
		                roles.forEach(function(role) {
		                    if(userData.role && userData.role  === role) {
		                        accessAllowed = true;
		                    }
		                });
		                // if route access allowed
		                if(accessAllowed) {
		                    req.user.userData = userData;
		                    next();
		                } else {
		                    return res.status(401).json({message: "Invalid token to access this api"});
		                }
		            } else {
		                console.log("roles not defined well in HasRole middleware, should be array and allowed multiple role also")
		                return res.status(500).json({message: "Role not defined in middleware"});
		            }
              	} else {
	                return res.status(500).json({message: "User not exist"});
              	}
	        } catch(e) {
	          console.log(e);
	          res.status(400).json({errMsg: e});
	        } 
	    }
	}
}