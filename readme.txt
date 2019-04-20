tutorials that I followed:

most of the app (node, nodemon, express, body-parser)
https://zellwk.com/blog/crud-express-mongodb/

httprequest
https://medium.freecodecamp.org/here-is-the-most-popular-ways-to-make-an-http-request-in-javascript-954ce8c95aaa

managing configuration files:
https://codeburst.io/node-js-best-practices-smarter-ways-to-manage-config-files-and-variables-893eef56cbef

###########

AH Dump Data model:

{
    "_id":"5c97893d2d1dc6137a722f64",
    "auc":785788630,
    "item":114829,
    "owner":"Téacup",
    "ownerRealm":"Frostwhisper",
    "bid":16814448,
    "buyout":16814448,
    "quantity":1,
    "timeLeft":"LONG",
    "rand":0,
    "seed":0,
    "context":13,
    "bonusLists":[{
        "bonusListId":189}]
}

###########

auc - an incrementing 32-bit auction id (which does rollover so not unique over periods of weeks, but unique enough over periods of hours/days)

item - the itemId of the item being auctioned

owner - the name of the player who posted the auction

ownerRealm - the realm of the player who posted the auction

bid - the current auction bid

buyout - the auction buyout

quantity - how many of the item are in this auction

timeLeft - how long this item has left (http://wow.gamepedia.com/Auction_House#Auction_lengths)

rand - Rand (also known as suffixID) is the stat boost for the item (if the item has one). Example, -12 is "of the Boar" http://wow.gamepedia.com/ItemRandomSuffix

seed - Seed from what I can gather is a unique value that may or may not contain creation information "Created by SlickWilly" that shows up in the tool tip

context - how the item was obtained/created. The ones I have been able to identify are 3 (normal dungeon drop), 4 (LFR drop), 5 (Heroic drop), 6 (Mythic drop), 13 (created by crafting). I believe 1 may have something to do with a quest reward or opening of a bag from a quest reward.


{
    "_id":"5c97893d2d1dc6137a722f64",
    "auc":785788630,
    "item":114829,
    "owner":"Téacup",
    "ownerRealm":"Frostwhisper",
    "bid":16814448,
    "buyout":16814448,
    "quantity":1,
    "timeLeft":"LONG",
    "rand":0,
    "seed":0,
    "context":13,
    "bonusLists":[{
        "bonusListId":189}]
}


############



1. Get all auctions with same item ID {item: 152512} //monelite ore
2. Amount of auctions of said item 
3. amount of total items on sale (monelite ore)
4. Monelite ore auctions grouped by seller and stacksize and price (per item), sorted by price


#######
PROSESSED_DATA_COLLECTION

batch: running integer

auc: bladefist_eu.auc
item: bladefist_eu.item
owner: bladefist_eu.owner
bid: bladefist_eu.bid
buyout: bladefist_eu.buyout
quantity: bladefist_eu.quantity
timeleft: bladefist_eu.timeLeft

TimeOfDataDump: bladefist_eu.timestamp
isNewAuction: (boolean)
	if(previous_batch.includes(this.auc)) then false
	else true
TBL: Time being listed
	if (this.isNewAuction == false) then TBL=previous_batch.TBL++
	else TBL = 1
Prediction: Hours left until expiration






















