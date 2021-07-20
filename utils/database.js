const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://carlos:GCcq4p1hT8lTUi3T@cluster0.yhobs.mongodb.net/shop?retryWrites=true&w=majority'
    ).then(client => {
        _db = client.db('shop');
        callback();
    }).catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'no database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;