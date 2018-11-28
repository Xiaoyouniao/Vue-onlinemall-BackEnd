var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var Goods = require('../models/goods')

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected success')
})

mongoose.connection.on('error', () => {
    console.log('MongoDB connected fail')
})

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('hello goods');
}).get('/list', (req, res, next) => { // 查询商品列表数据
    let page = parseInt(req.query.page)
    let pageSize = parseInt(req.query.pageSize)
    let priceLevel = req.query.priceLevel
    let sort = parseInt(req.query.sort)
    let skip = (page - 1) * pageSize
    var priceGt = ''
    var priceLte = ''
    let params = {}
    if (priceLevel != 'all') {
        switch (priceLevel) {
            case '0':
                {
                    priceGt = '0'
                    priceLte = '100'
                    break
                }
            case '1':
                {
                    priceGt = '100'
                    priceLte = '500'
                    break
                }
            case '2':
                {
                    priceGt = '500'
                    priceLte = '1000'
                    break
                }
            case '3':
                {
                    priceGt = '1000'
                    priceLte = '5000'
                    break
                }
        }
        params = {
            'salePrice': {
                '$gt': priceGt,
                '$lte': priceLte
            }
        }
    }

    let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
    goodsModel.sort({ salePrice: sort })
    goodsModel.exec((err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
}).post('/addCart', (req, res, next) => { // 将商品加入到购物车
    var userId = '100000077'
    var productId = req.body.productId
    var User = require('../models/users')
    User.findOne({ userId: userId }, (err, userDoc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message
            })
        } else {
            if (userDoc) {
                var goodsItem = ''
                userDoc.cartList.forEach(item => {
                    if (item.productId == productId) {
                        goodsItem = item
                        item.productNum++
                    }
                })
                if (goodsItem) {
                    userDoc.save((err, doc) => {
                        if (err) {
                            res.json({
                                status: 1,
                                msg: err.message
                            })
                        } else {
                            res.json({
                                status: 0,
                                msg: '',
                                result: 'success'
                            })
                        }
                    })
                } else {
                    Goods.findOne({ productId: productId }, (err, doc) => {
                        if (err) {
                            res.json({
                                status: 1,
                                msg: err.message
                            })
                        } else {
                            if (doc) {
                                doc.productNum = 1
                                doc.checked = 1
                                userDoc.cartList.push(doc)
                                userDoc.save((err, doc) => {
                                    if (err) {
                                        res.json({
                                            status: 1,
                                            msg: err.message
                                        })
                                    } else {
                                        res.json({
                                            status: 0,
                                            msg: '',
                                            result: 'success'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
})

module.exports = router;