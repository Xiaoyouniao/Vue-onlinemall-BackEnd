var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var User = require('../models/users')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('hello users');
});
router.post('/login', (req, res, next) => { // 登录接口
    /**
     * 1. 获取表单提交数据
     * 2. 查询数据库，验证密码
     * 3. 根据查询结果设置网页cookie
     */

    var param = {
        userName: req.body.userName
    }

    User.findOne(param, (err, doc) => {

        if (err) {
            res.json({
                status: 1,
                msg: err.message
            })
        } else if (err == null && doc == null) {
            res.json({
                status: 2,
                msg: '用户不存在'
            })
        }
        if (doc) {
            if (doc.userPassword == req.body.userPwd) {
                res.cookie('userId', doc.userId, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                })
                res.cookie('userName', doc.userName, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                })
                res.json({
                    status: 0,
                    msg: '',
                    result: {
                        userName: doc.userName
                    }
                })
            } else {
                res.json({
                    status: 2,
                    msg: '密码错误'
                })
            }

        }
    })
}).post('/logout', (req, res, next) => { // 退出登录接口，删除cookie
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    })
    res.cookie('userName', '', {
        path: '/',
        maxAge: -1
    })
    res.json({
        status: 0,
        msg: '',
        result: ''
    })

}).get('/checkLogin', (req, res, next) => {
    if (req.cookies.userId) {
        res.json({
            status: 0,
            msg: '',
            result: req.cookies.userName || ''
        })
    } else {
        res.json({
            status: 1,
            msg: '未登录',
            result: ''
        })
    }
}).get('/getCartCount', (req, res, next) => {
    if (req.cookies && req.cookies.userId) {
        var userId = req.cookies.userId
        User.findOne({ 'userId': userId }, (err, doc) => {
            if (err) {
                res.json({
                    status: 0,
                    msg: err.message
                })
            } else {
                let cartList = doc.cartList;
                let cartCount = 0
                cartList.map(item => {
                    cartCount += parseFloat(item.productNum)
                })
                res.json({
                    status: 0,
                    msg: "",
                    result: cartCount
                })
            }
        })
    } else {
        res.json({
            status: 0,
            msg: '当前用户不存在'
        })
    }
}).get('cartList', (req, res, next) => {
    var userId = req.cookies.userId
    User.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                res.json({
                    status: 0,
                    msg: '',
                    result: doc.cartList
                })
            }
        }
    })
}).post('/cartDel', (req, res, next) => { // 删除购物车中商品
    var userId = req.cookies.userId
    var productId = req.body.productId
    User.update({ userId: userId }, { $pull: { 'cartList': { 'productId': productId } } }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: 'success'
            })
        }
    })
}).post('/cartEdit', (req, res, next) => { // 修改购物车中选中商品数量
    /**
     * 1. 获取用户信息及表单提交信息
     * 2. 连接数据库，更新修改商品的数量和选中状态
     * 3. 返回响应
     */
    var userId = req.cookies.userId
    var productId = req.body.productId
    var productNum = req.body.productNum
    var checked = req.body.checked

    User.update({ 'userId': userId, 'cartList.productId': productId }, {
        'cartList.$.productNum': productNum,
        'cartList.$.checked': checked
    }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: 'success'
            })
        }
    })
}).post('editCheckAll', (req, res, next) => { // 设置购物车中商品全选及取消全选
    var userId = req.cookies.userId
    var checkAll = req.body.checkAll ? '1' : '0'
    User.findOne({ userId: userId }, (err, user) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (user) {
                user.cartList.forEach(item => {
                    item.checked = checkAll
                })
                user.save((err, doc) => {
                    if (err) {
                        res.json({
                            status: 1,
                            msg: err.message,
                            result: ''
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
}).get('/addressList', (req, res, next) => { // 查询用户地址接口
    var userId = req.cookies.userId
    User.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: doc.addressList
            })
        }
    })
}).post('/setDefault', (req, res, next) => { // 设置默认地址
    var userId = req.cookies.userId
    var addressId = req.body.addressId
    if (!addressId) {
        res.json({
            status: 1003,
            msg: 'addressId is null',
            result: ''
        })
    } else {
        User.findOne({ userId: userId }, (err, doc) => {
            if (err) {
                res.json({
                    status: 1,
                    msg: err.message,
                    result: ''
                })
            } else {
                var addressList = doc.addressList
                addressList.forEach(item => {
                    if (item.addressId == addressId) {
                        item.isDefault = true
                    } else {
                        item.isDefault = false
                    }
                })

                doc.save((err, doc) => {
                    if (err) {
                        res.json({
                            status: 1,
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        res.json({
                            status: 0,
                            msg: '',
                            result: ''
                        })
                    }
                })
            }
        })
    }
}).post('delAddress', (req, res, next) => {
    var userId = req.cookies.userId
    User.update({ userId: userId }, { $pull: { 'addressList': { 'addressId': addressId } } }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: ''
            })
        }
    })
}).post('/payment', (req, res, next) => {
    var userId = req.cookies.userId
    var addressId = req.body.addressId
    var orderTotal = req.body.orderTotal

    User.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            var address = ''
            var goodsList = []

            doc.addressList.forEach(item => {
                if (addressId == item.addressId) {
                    address = item
                }
            })

            doc.cartList.filter(item => {
                if (item.checked == '1') {
                    goodsList.push(item)
                }
            })

            var platform = '622'
            var r1 = Math.floor(Math.random() * 10)
            var r2 = Math.floor(Math.random() * 10)

            var sysDate = new Date().Formate('yyyyMMddhhmmss')
            var createDate = new Date().Formate('yyyy-MM-dd hh:mm:ss')
            var orderId = platform + r1 + sysDate + r2
            var order = {
                orderId: orderId,
                orderTotal: orderTotal,
                addressInfo: address,
                goodsList: goodsList,
                orderStatus: 1,
                createDate: createDate
            }

            doc.orderList.push(order)

            doc.save((err, doc) => {
                if (err) {
                    res.json({
                        status: 1,
                        msg: err.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: 0,
                        msg: '',
                        result: {
                            orderId: order.orderId,
                            orderTotal: orderTotal
                        }
                    })
                }
            })
        }
    })
}).get('/orderDetail', (req, res, next) => { // 根据订单id获取订单信息
    var userId = req.cookies.userId
    var orderId = req.param('orderId')
    User.findOne({ userId: userId }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            var orderList = doc.orderList
            if (orderList.length > 0) {
                var orderTotal = 0
                orderList.forEach(item => {
                    if (item.orderId == orderId) {
                        orderTotal = item.orderTotal
                    }
                })
                if (orderTotal > 0) {
                    res.json({
                        status: 0,
                        msg: '',
                        result: {
                            orderId: orderId,
                            orderTotal: orderTotal
                        }
                    })
                } else {
                    res.json({
                        status: 120002,
                        msg: '无此订单',
                        result: ''
                    })
                }
            } else {
                res.json({
                    status: 120001,
                    msg: '当前用户未创建订单',
                    result: ''
                })
            }
        }
    })
}).get('/hh', (req, res, next) => {
    User.findOne({ userId: '100000077' }, (err, doc) => {
        if (err) res.json({
            status: 1,
            msg: err.message
        })
        res.send(doc)
    })
})

module.exports = router;