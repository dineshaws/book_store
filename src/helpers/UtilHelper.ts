import * as moment from 'moment';

export default class UtilHelper {

	public static getRandomArrayElements(arr, count) {
		let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
		while (i-- > min) {
		    index = Math.floor((i + 1) * Math.random());
		    temp = shuffled[index];
		    shuffled[index] = shuffled[i];
		    shuffled[i] = temp;
		}
		return shuffled.slice(min);
	}
	
	/* * function to get Timestamp 
	* * @return timestamp
	* */
	public static getTimestamp() {
		let ts = moment.utc().format('x');    
	    return parseInt(ts);
	}

}