const axios = require('axios');
const fs = require('fs');

class Canvas {
    constructor (token) {
        this.token = token;
        this.url = 'canvas.instructure.com'
        this.courses = [];
        this.fileUrls = [];
    }

    getCourses () {
        return this.courses;
    }

    async findCourses () {
        const response = await fetch(`https://${this.url}/api/v1/courses`, {
        headers: {
            Authorization: `Bearer ${this.token}`
        }
        });
        const courses = await response.json();
        this.courses = courses;
        return courses;
    }

    async findFilesFromCourse (id) {
        console.log(id);
        const response = await fetch(`https://${this.url}/api/v1/courses/${id}/files`, {
        headers: {
            Authorization: `Bearer ${this.token}`
        }
        });
        console.log(response);
        const files = await response.json();
        const pdfs = files.filter(file => file['content-type'] === 'application/pdf');
        const urls = pdfs.map(pdf => pdf.url);
        console.log(urls);
        this.fileUrls = urls;
        return files;
    }

    //write file to disk randomly generated name, return list of file names
    async writeFiles () {
        let fileNames = [];
        //create directory if it doesn't exist 
        if (!fs.existsSync(`./data/${this.token}`)){
            fs.mkdirSync(`./data/${this.token}`);
        }
    
        for (let i = 0; i < this.fileUrls.length; i++) {
            const url = this.fileUrls[i];
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const fileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.pdf`;
            fileNames.push(fileName);
            fs.writeFileSync(`./data/${this.token}/${fileName}`, response.data);
        }
        return fileNames;
    }

}


module.exports = Canvas;