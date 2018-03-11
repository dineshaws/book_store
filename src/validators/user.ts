/**
 * JSON schema and mapping defined here
*/
module.exports.signup = {
    "id": "/User",
    "type": "object",
    "properties": {
        "username": { "type": "string", "maxLength": 50},
        "password": {"type": ["number", "string"]},
        "email": { "type": "string", "maxLength": 50 },
    },
    "required": [
        "username",
        "password",
        "email"
    ]
};

module.exports.signin = {
    "id": "/User",
    "type": "object",
    "properties": {
        "password": {"type": ["number", "string"]},
        "email": { "type": "string","maxLength": 50 },
    },
    "required": [
        "password",
        "email"
    ]
};
