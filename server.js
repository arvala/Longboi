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
// TODO: OAUTH implementation to refresh token
// Currently a static token is used --> it deprecates in 24h
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
	console.log('button pressed')
    getAuctionDataFromBlizzardAPI();
    res.redirect('/')
})

//activates ah data dump when button in UI is pressed
app.post('/query', (req, res) => {
	console.log('queried database')
    queryDbForDocumentCount(queryAmountOfMoneliteOreAuctions);
    queryDbForTotalItemCount(queryTotalAMountOfMoneliteOreOnSale);
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
//setInterval(getAuctionDataFromBlizzardAPI, 1800000);

function getAuctionDataFromBlizzardAPI(){
	const Http = new XMLHttpRequest();
	const url='https://'+region+'.api.blizzard.com/wow/auction/data/'+wow_server+'?locale=en_US&access_token='+token;
	Http.open("GET", url);
	Http.send();
	console.log('getting dataurl from '+url)
	Http.onreadystatechange=function(){
		if(this.readyState==4 && this.status==200){
			console.log(Http.responseText)
			let obj = JSON.parse(Http.responseText)
			let dataurl = obj.files[0].url;
			console.log(dataurl)
			SaveAhDataToMongo(dataurl);
		}
		else(console.log(this.readystate +' '+ this.status))
	}
}

function SaveAhDataToMongo(dataurl){
	const Http2 = new XMLHttpRequest();
	Http2.open("GET", dataurl);
	Http2.send();
	Http2.onreadystatechange=function(){
		if(this.readyState==4 && this.status==200){
			let obj2 = JSON.parse(Http2.responseText)
			let ah_data = obj2.auctions;
			//adding timestamps to auction objects
			for (let auction of ah_data) {
				addTimestampsToAuction(auction)
			}
			//console.log(ah_data)
			db.collection('bladefist_eu').insertMany(ah_data, (err, result) => {
   				if (err) return console.log(err)
  				console.log('saved ah dump to to database')
    			//res.redirect('/')
  			}) 
		}
	}
}

function addTimestampsToAuction(auction){
	var today = new Date();
	var month = today.getMonth();
	if (month < 10) {
		month = '0' + month;
	}
	var day = today.getDate();
	if (day < 10) {
		day = '0' + day;
	}
	var weekday = today.getDay();
	var date = today.getFullYear().toString()+month+day
	var hour = today.getHours();
    auction.timestampOfDump = today;
    auction.dateOfDump = date;
    auction.weekdayOfDump = weekday;
    auction.hourOfDump = hour;
}

function queryDbForDocumentCount(query){
	db.collection('bladefist_eu').countDocuments(query, (err, result) => {
	if (err) return console.log(err)
	console.log(result)
    //res.redirect('/')
  	}) 
}

function queryDbForTotalItemCount(query){
	db.collection('bladefist_eu').aggregate(query).toArray().then(results => {
  		console.log(results)
	})
}
var queryAmountOfMoneliteOreAuctions = {item: 152512};
var queryTotalAMountOfMoneliteOreOnSale = [{$match: {item: 152512}}, {$group:{_id: { item: "$item" }, totalAmount: { $sum: "$quantity" }, count: { $sum: 1 }}}]

