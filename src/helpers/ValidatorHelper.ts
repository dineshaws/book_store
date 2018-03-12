import * as Ajv from 'ajv';
let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

/**
 * Class representing an Schema Validator.
 */
export default class ValidatorHelper {

  public static schemaValidate(schemaObj, validatorFile) {
    return function(req, res, next) {
        const url = req.originalUrl;
        //console.log("url ",url)
        //console.log("req.body ",req.body)

        const validatorObj = require('../validators/'+validatorFile);
        const instance = req.body;
        const schema = validatorObj[schemaObj];
        let validate = ajv.compile(schema);
        const valid = validate(instance);
        if (!valid) {
            //console.log(validate.errors);
            return res.status(409).json({"apiStatus": "Failure", message: "validaion errors",error:validate.errors});
        } else {
            return next();
        }
    }
  }

}