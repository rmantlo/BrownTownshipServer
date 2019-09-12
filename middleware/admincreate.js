let express = require('express');
let sequelize = require('../db');
let User = sequelize.import('../models/users');
let bcrypt = require('bcryptjs');

module.exports = function (req, res) {
    User.findOne({ where: { username: "browntwp" } })
        .then(function (user) {
            if (!user) {
                User.create({
                    username: "browntwp",
                    passwordhash: bcrypt.hashSync(process.env.ADMINPASS, 10)
                })
                    .then()
                    .catch(err => console.log(err))
            }
            else {
                //res.status(200).json('Admin already created')
                console.log('Admin already created')
            }
        },
            function (err) {
                //res.status(500).json('Default Admin not created: 2')
                console.log(err)
            }
        )
        .catch(err => {
            //req.status(400).json('IDK')
            console.log(err)
        })
}