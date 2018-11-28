var mongoose = require('mongoose')
var fs = require('fs')
var Good = require('../../models/goods')
var User = require('../../models/users')


mongoose.connection.on('connected', () => {
    console.log('MongoDB connected success')
})

mongoose.connection.on('error', () => {
    console.log('MongoDB connected fail')
})

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
})

fs.readFile('server/resource/mall-goods', (err, data) => {
    if (err) {
        return console.log(err)
    }
    productList = JSON.parse(data).items

    productList.forEach(item => {
        new Good(item).save()
    })

})

// fs.readFile('./resource/mall-users', (err, data) => {
//     if (err) {
//         return console.log(err)
//     }
//     userList = JSON.parse(data)

//     new User(userList).save()
// })