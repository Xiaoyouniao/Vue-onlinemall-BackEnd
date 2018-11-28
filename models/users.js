var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mall')

var userSchema = new mongoose.Schema({
    "userId": {
        type: String
    },
    "userName": {
        type: String
    },
    "userPassword": {
        type: String
    },
    "orderList": {
        type: Array
    },
    "cartList": [{
        "productId": {
            type: String
        },
        "productName": {
            type: String
        },
        "salePrice": {
            type: String
        },
        "checked": {
            type: String
        },
        "productNum": {
            type: String
        },
        "productImage": {
            type: String
        },
        "productImage": {
            type: String
        }
    }],
    "addressList": [{
        "addressId": String,
        "userName": String,
        "streetName": String,
        "postCode": Number,
        "tel": Number,
        "isDefault": Boolean
    }]
})

module.exports = mongoose.model("User", userSchema)