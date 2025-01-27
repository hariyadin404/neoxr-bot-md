let axios = require('axios')
let fetch = require('node-fetch')
let fs = require('fs')
let http = require('https')
let chalk = require('chalk')
let path = require('path')
let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

class Function {
	delay = time => new Promise(res => setTimeout(res, time))
	isUrl(str) {
		let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  		  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
 		   '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
   		 '(\\#[-a-z\\d_]*)?$','i') // fragment locator
		return !!pattern.test(str)
	}

	async fetchJson(url, head = {}) {
		let result = await (await fetch(url, { headers: head })).json()
		return result
	}
	
	async fetchBuffer(str) {
		return new Promise(async(resolve, reject) => {
			if (this.isUrl(str)) {
				let buff = await (await fetch(str)).buffer()
				resolve(buff)
			} else {
				let buff = fs.readFileSync(str)
				resolve(buff)
			}
		})
	}

    texted(type, text) {
    	switch (type) {
    		case 'bold': return '*' + text + '*'
		break
			case 'italic': return '_' + text + '_'
		break
			case 'monospace': return '```' + text + '```'
    	}
    }
    
    download(url, filename, callback) {
		let file = fs.createWriteStream(filename)
		http.get(url, function(response) {
			response.pipe(file)
			file.on('finish', function() {
				file.close(callback)
			})
		})
	}

	mtype(data) {
		function replaceAll(str) {
			let res = str.replace(new RegExp('```', 'g'), '')
			.replace(new RegExp('_', 'g'), '')
			.replace(new RegExp(/[*]/, 'g'), '')
			return res
		}
		let type = (typeof data.text !== 'object') ? replaceAll(data.text) : ''
		return type
	}

	color(text, color) {
    	return chalk.keyword(color || 'green').bold(text)
	}
    
    switcher(status, isTrue, isFalse) {
    	return (status) ? this.texted('bold', isTrue) : this.texted('bold', isFalse) 
    }
	
	sizeLimit(str, max) {
		let data
		if (str.match('G') || str.match('GB') || str.match('T') || str.match('TB')) return data = { oversize: true }
		if (str.match('M') || str.match('MB')) {
			let first = str.replace(/MB|M|G|T/g, '').trim()
			if (isNaN(first)) return data = { oversize: true }
			if (first > max) return data = { oversize: true }
				return data = { oversize: false }
		} else {
				return data = { oversize: false }
		}
	}
	
	reload(file) {
		fs.watchFile(file, () => {
			fs.unwatchFile(file)
			console.log(chalk.redBright.bold('[ UPDATE ]'), chalk.blueBright(moment(new Date() * 1).format('DD/MM/YY HH:mm:ss')), chalk.green.bold('~ ' + path.basename(file)))
			delete require.cache[file]
			require(file)
		})
	}
	
	shorten(url) {
		return new Promise(async(resolve, reject) => {
		try {
			let form = new URLSearchParams()
			form.append('url', url)
			let json = await (await axios.post('https://home.s.id/api/public/link/shorten', form)).data
			if (typeof json.short == 'undefined') return resolve({ creator: '@neoxrs – Wildan Izzudin', status: false })
			resolve({ creator: '@neoxrs – Wildan Izzudin', status: true, data: { url: 'https://s.id/' + json.short }})
		} catch { 
			resolve({ creator: '@neoxrs – Wildan Izzudin', status: false })
		}})
	}
	
	example(isPrefix, command, args) {
		return `• ${this.texted('bold', 'Example')} : ${isPrefix + command} ${args}`
	}
	
	uuid() {
   	 var dt = new Date().getTime()
 	   var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       	 var r = (dt + Math.random()*16)%16 | 0;
    	    var y = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    	}); return uuid
	}

	toTime(ms) {
		let h = Math.floor(ms / 3600000)
		let m = Math.floor(ms / 60000) % 60
		let s = Math.floor(ms / 1000) % 60
		return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
	}

	removeItem(arr, value) {
		let index = arr.indexOf(value)
		if (index > -1) arr.splice(index, 1)
		return arr
	}

	igFixed(url) {
		let count = url.split('/')
		if (count.length == 7) {
			let username = count[3]
			let destruct = this.removeItem(count, username)
			return destruct.map(v => v).join('/')
		} else return url
	}

	// tambah sendiri . . .
}

exports.Function = Function