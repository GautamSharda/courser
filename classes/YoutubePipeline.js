var getSubtitles = require('youtube-captions-scraper').getSubtitles;
const YTMetadata = require('youtube-metadata-from-url');
const Source = require("../models/source");
const Course = require("../models/course");
// const link = "https://www.youtube.com/watch?v=fDAPJ7rvcUw";
//https://www.youtube.com/watch?v=NJSO52hGZGs
// let videoID = link.split("v=")[1];
const TYPE = "YouTube";

class YouTubePipeline {
	constructor(courseID, links) {
		this.courseID = courseID;
		this.links = links.map(link => this.reduce(link));
	}

	reduce(link) {
		const parsedUrl = new URL(link);
		// Extract the 'v' query parameter
		const videoId = parsedUrl.searchParams.get('v');
		// Construct the clean URL with only the 'v' parameter
		const cleanUrl = new URL(parsedUrl.origin + parsedUrl.pathname);
		if (videoId) {
			cleanUrl.searchParams.set('v', videoId);
		}
		const completedUrl = cleanUrl.toString();
		return completedUrl;
	}

	async getCaptions() {
		const videoIds = this.links.map(link => this.getVideoID(link));
		const ids = [];
		//loop through video ids
		for (let videoID of videoIds) {
			console.log("videoID: ", videoID);
			//get the video metadata
			try {
				const id = await this.createTranscription(videoID);
				ids.push(id);
			} catch(e) {}
		}
		//push the ids to the course's transciprtion array
		const course = await Course.findById(this.courseID);
		ids.forEach(id => course.sourceFiles.push(id));
		await course.save();
		return course;
	}

	async createTranscription(videoID) {
		const captions = await this.getVideoMetadata(videoID);
		const title = captions[0].title;

		//create new Source in the database
		const transcription = new Source({name: title, type: TYPE, courseId: this.courseID});
		const id = transcription._id.toString();

		//for each caption, call the reducer
		const chunks = captions.map(caption => this.getChunkFromCaption(caption, id));
		transcription.chunks = chunks;

		try{
			await transcription.save();
		}catch(e){
			console.log("transcription save error: ", e);
		}

		return id;
	}
 
	secondsToTimeStamp(seconds) {
		//round to nearest second
		seconds = Math.round(seconds);
		return `&t=${seconds}s`
	}

	getChunkFromCaption(transcription, id) {
		const {link, start, text } = transcription;
		return {text, link: `${link}${this.secondsToTimeStamp(start)}`, sourceId: id};
	}

	//internal method to get the videoID from the link
	getVideoID(link) {
		return link.split("v=")[1];
	}

	//internal method to get the video metadata from the videoID
	async getVideoMetadata(videoID) {
		const captions = await getSubtitles({videoID: videoID, lang: 'en'})
		let newCaptions = [];
		const link = `https://www.youtube.com/watch?v=${videoID}`
		let curObj = {
			text: captions[0].text,
			dur: Number(captions[0].dur),
			start: Number(captions[0].start),
			link: link
		};
	
		for (let i = 1; i < captions.length; i++) {
			if (curObj.text.length + "\n".length + captions[i].text.length <=1000 || i == captions.length - 1) {
				curObj.text += "\n" + captions[i].text;
				curObj.dur = curObj.dur + Number(captions[i].dur);
			} else {
				newCaptions.push(curObj);
				curObj = captions[i];
				curObj.dur = Number(curObj.dur);
				curObj.start = Number(curObj.start);
				curObj.link = link;
			}
		}
		newCaptions.push(curObj);
	
		const metadata = await YTMetadata.metadata(link);
		newCaptions = newCaptions.map(item => ({ ...item, title: metadata.title }));
		return newCaptions;
	}
}


module.exports = YouTubePipeline;
