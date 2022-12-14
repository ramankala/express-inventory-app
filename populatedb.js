#! /usr/bin/env node

console.log('This script populates some test items, and categories to your database.  Specified database as argument - e.g.: populatedb mongodb+srv://expressinventory:coolpassword@inventory-cluster.emyamaj.mongodb.net/?retryWrites=true&w=majority');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const Categories = require('./models/categories');
const Items = require('./models/items');

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const categories = []
const items = []

function categoryCreate(name, description, cb) {
    const category = new Categories( {name: name, description: description } );

    category.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Category: ' + category);
        categories.push(category)
        cb(null, category)
    });
}

function itemsCreate(name, description, category, price, numInStock, cb) {
    const item = new Items( {
        name: name,
        description: description,
        category: category,
        price: price,
        numInStock: numInStock
    }
    )
    item.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Item: ' + item);
        items.push(item)
        cb(null, item)
    });
}

function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate('Fruits', 'Fleshy or dry ripened ovary of a flowering plant, enclosing the seed or seeds.', callback);
        },
        function(callback) {
            categoryCreate('Meats', 'Flesh or edible parts of animals used for food', callback);
        },
        function(callback) {
            categoryCreate('Dairy', 'Milk from a cow or other domestic animal.', callback);
        },
    ],
    //optional callback
    cb);
}

function createItems(cb) {
    async.parallel([
        function(callback) {
            itemsCreate('Apple', 'Edible fruit produced by an apple tree.', [categories[0],], 3, 12, callback);
        },
        function(callback) {
            itemsCreate('Banana', 'Curved, yellow fruit with a thick skin and soft sweet flesh.', [categories[0]], 4, 24, callback);
        },
        function(callback) {
            itemsCreate('Grapes', 'Fleshy, rounded fruits that grow in clusters made up of many fruits of greenish, yellowish or purple skin.', [categories[0]], 5, 32, callback);
        },
        function(callback) {
            itemsCreate('Chicken', 'Chicken meat grown specifically for consumption as meat after processing.', [categories[1]], 7, 36, callback);
        },
        function(callback) {
            itemsCreate('Beef', 'Culinary name for meat from cattle.', [categories[1]], 8, 36, callback);
        },
        function(callback) {
            itemsCreate('Pork', 'Culinary name for the meat of the domesticated pig.', [categories[1]], 9, 36, callback);
        },
        function(callback) {
            itemsCreate('Cheese', 'Dairy product produced in wide ranges of flavours, textures, and forms by coagulation of the milk protein casein.', [categories[2]], 9, 32, callback);
        },
        function(callback) {
            itemsCreate('Milk', 'White liquid food produced by the mammary glands of mammals. Primary source of nutrition for young mammals.', [categories[2]], 11, 32, callback);
        },
        function(callback) {
            itemsCreate('Ice Cream', 'Sweetened frozen food typically eaten as a snack or dessert. It may be made from milk or cream and is flavoured with a sweetener.', [categories[2]], 12, 28, callback);
        }
    ],
    // optional callback
    cb);
}

async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    }
    else {
        console.log('ITEMS: '+items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
}
);