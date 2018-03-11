import { Schema, model } from 'mongoose';

let schema: Schema = new Schema({
	id : String,
    title: String,
    subtitle: String,
    authors:Array,
    categories:Array,
    cover: String,
    publisher: String,
    editor: String,
    publishedDate: String,
    description:String,
    isbn: {
    	isbn_10: String,
    	isbn_13: String
    },
    status: {type:Number, default: 1}, // 0 - inactive, 1- active
    seed_type:String // 'api', 'seed', 'ui'
});

export default model('Book', schema);