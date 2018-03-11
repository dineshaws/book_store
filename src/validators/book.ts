/**
 * JSON schema and mapping defined here
*/
module.exports.search = {
    "id": "/User",
    "type": "object",
    "properties": {
        "search_key": { "type": "string", "maxLength": 50},
        "search_by": {"type":"string", "enum": [ "title", "authors", "isbn_10", "isbn_13", "categories"] } // categories as genre
    },
    "required": [
        "search_key",
        "search_by"
    ]
};

module.exports.add = {
    "id": "/User",
    "type": "object",
    "properties": {
        "id": { "type": "string", "maxLength": 50},
        "title": {"type": ["number", "string"], "maxLength": 150},
        "description": { "type": "string", "maxLength": 500 },
        "authors": { "type": "array"},
        "isbn_10": { "type": "string", "maxLength": 10 },
        "categories": { "type": "array"},
    },
    "required": [
        "title",
        "description",
        "authors",
        "isbn_10",
        "categories"
    ]
};
