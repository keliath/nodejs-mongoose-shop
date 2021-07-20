const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');

// const getDb = require('../utils/database').getDb;

// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     };

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             dbOp = db.collection('products').updateOne({
//                 _id: this._id
//             }, {
//                 $set: this //{}
//             }); //updateOne {} or updateMany [] 1 or 2+
//         } else {
//             dbOp = db.collection('products').insertOne(this); //insertOne {} or insertMany [] 1 or 2+
//         }
//         return dbOp.then(result => {
//             // console.log("savedb: ", result);
//         }).catch(err => console.log(err));
//     };

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products').find().toArray().then(products => {
//             // console.log(products);
//             return products;
//         }).catch(err => console.log(err)); //to array only if you know its doesnt be much data
//     };

//     static findById(prodId) {
//         const db = getDb();
//         return db.collection('products').find({
//             _id: new mongodb.ObjectId(prodId)
//         }).next().then(product => {
//             // console.log('one product: ', product);
//             return product;
//         }).catch(err => console.log(err));
//     };

//     static deleteById(prodId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({
//             _id: new mongodb.ObjectId(prodId)
//         }).then(result => {
//             console.log('deleted', result);
//         }).catch(err => console.log(err));
//     };
// }

// module.exports = Product;