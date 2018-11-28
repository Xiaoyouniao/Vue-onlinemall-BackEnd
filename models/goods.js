var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mall')

var productSchema = new mongoose.Schema({
    "productId": {
        type: String
    },
    "productName": {
        type: String
    },
    "salePrice": {
        type: Number
    },
    "checked": {
        type: String
    },
    "productNum": {
        type: Number
    },
    "productImage": {
        type: String
    }
})

module.exports = mongoose.model("Good", productSchema)