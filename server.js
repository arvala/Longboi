const express = require('express');
const MongoClient = require('mongodb').MongoClient
const bodyParser= require('body-parser') //handles reading data from <form> elements
const app = express();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
app.set('view engine', 'ejs') // handles the rendering of the quote-forms in the front, not yet utilized in core longboi-functionalities
app.use(bodyParser.urlencoded({extended: true}))


app.get('/', (req, res) => {     
    var cursor = db.collection('quotes').find()
    db.collection('quotes').find().toArray(function(err, result) {
        if (err) return console.log(err)
        res.render('index.ejs', {quotes: result})
    })
})

// variables imported from config.js, which is not included in git repo
const config = require('./config.js');
const region = config.region;
const wow_server = config.wow_server; 
const token = config.token; 
const database_username = config.database_username; 
console.log('token is '+region)
const database_password = config.database_password; 
const node_port = config.node_port;


// This section responds to the buttons in the frontend to save quotes
app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  }) 
})

//activates ah data dump when button in UI is pressed
app.post('/ahdata', (req, res) => {
    getAuctionDataFromBlizzardAndSaveItToMongo()
    res.redirect('/')
})

//connects to the MongoDB database and listens to port 3000 if the connection is established
MongoClient.connect('mongodb+srv://'+database_username+':'+database_password+'@cluster0-cnr8x.mongodb.net/test?retryWrites=true', (err, client) => {
  if (err) return console.log(err)
  db = client.db('longboi') // whatever your database name is
  app.listen(node_port, () => {
    console.log('listening on '+node_port)
  })
})

//app gets ah dumps with a 1800sec (30min) interval
setInterval(getAuctionDataFromBlizzardAndSaveItToMongo, 1800000);

function getAuctionDataFromBlizzardAndSaveItToMongo(){
	const Http = new XMLHttpRequest();
	const url='https://'+region+'.api.blizzard.com/wow/auction/data/'+wow_server+'?locale=en_US&access_token='+token;
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange=function(){
		if(this.readyState==4 && this.status==200){
			console.log(Http.responseText)
			let obj = JSON.parse(Http.responseText)
			let dataurl = obj.files[0].url;
			console.log(dataurl)

			const Http2 = new XMLHttpRequest();
			Http2.open("GET", dataurl);
			Http2.send();
			Http2.onreadystatechange=function(){
				if(this.readyState==4 && this.status==200){
					let obj2 = JSON.parse(Http2.responseText)
					let ah_data = obj2.auctions;
					//console.log(ah_data)
					db.collection('bladefist_eu').insertMany(ah_data, (err, result) => {
    					if (err) return console.log(err)
  						console.log('saved ah dump to to database')
    					//res.redirect('/')
  					}) 
				}
			}
		}
	}
}