var getSubtitles = require('youtube-captions-scraper').getSubtitles;
const YTMetadata = require('youtube-metadata-from-url');
const fs = require('fs');

const link = "https://www.youtube.com/watch?v=fDAPJ7rvcUw";
let videoID = link.split("v=")[1];

getSubtitles({
	videoID: videoID, // youtube video id
	lang: 'en' // default: `en`
}).then(async (captions) => {
	let newCaptions = [];
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

	console.log(newCaptions);
});