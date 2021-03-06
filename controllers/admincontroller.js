let express = require('express');
let router = express.Router();
let sequelize = require('../db');
let User = sequelize.import('../models/users');
let Budget = sequelize.import('../models/documents');
let Event = sequelize.import('../models/events');
let bcrypt = require('bcryptjs');
let Op = require('sequelize').Op;

//user info under validated session
router.get('/userinfo', (req, res) => {
    User.findOne({ where: { id: req.user.id } })
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json(err))
})
router.get('/getalluserinfo', (req, res) => {
    User.findAll({ where: { id: { [Op.not]: req.user.id } } })
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json(err))
})
router.post('/createuser', (req, res) => {
    if (req.user.id == 1) {
        if (req.body.password.match("[a-z]+") && req.body.password.match("[A-Z]+") && req.body.password.match("[0-9]+") && req.body.password.length >= 8) {
            User.create({
                username: req.body.username,
                passwordhash: bcrypt.hashSync(req.body.password, 10)
            })
                .then(user => {
                    res.status(200).json({
                        user: user,
                        message: 'user created'
                    })
                })
                .catch(err => res.status(500).json({ error: 'user not created' }))
        }
        else {
            res.status(500).json({ error: "Password must be at least 8 characters long and contain upper and lower case letters and at least one number. Cannot contain special characters." })
        }
    }
    else { res.status(500).json({ error: "Only Main Admin Account can create new accounts" }) }
})
router.put('/updatepassword', (req, res) => {
    if (req.userid === 1) {
        res.status(500).json({ error: 'Cannot change default admin password, contact support' });
    } else {
        User.findOne({ where: { id: req.user.id } })
            .then(function (user) {
                if (user) {
                    bcrypt.compare(req.body.oldPassword, user.passwordhash, (err, matches) => {
                        if (matches) {
                            if (req.body.newPassword.match("[a-z]+") && req.body.newPassword.match("[A-Z]+") && req.body.newPassword.match("[0-9]+") && req.body.newPassword.length >= 8) {
                                User.update({ passwordhash: bcrypt.hashSync(req.body.newPassword, 10) },
                                    { where: { id: req.user.id } }
                                )
                                    .then(user => res.status(200).json(user), err => res.status(500).json(err))
                                    .catch(err => res.status(500).json(err))
                            }
                            else {
                                res.status(409).json({ error: "New password needs 8 characters, upper and lower case, and atleast one number. No special characters" });
                            }
                        } else {
                            res.status(500).json({ error: 'old password not correct' })
                        }
                    })
                } else {
                    res.status(500).json({ error: 'user does not exist' })
                }
            },
                function (err) {
                    res.status(500).json({ error: 'cannot find anything' })
                })
            .catch(err => res.status(500).json(err))
    }
})
router.delete('/deleteuser', (req, res) => {
    if (req.user.id === 1) {
        res.status(500).json('Cannot delete Main Admin Account');
    }
    else {
        User.destroy({ where: { id: req.user.id } })
            .then(user => res.status(200).json('user deleted'))
            .catch(err => res.status(500).json({ error: err, message: 'user not deleted' }))
    }
})
router.delete('/deleteotheruser/:id', (req, res) => {
    if (req.user.id == 1 && req.params.id != 1) {
        User.destroy({ where: { id: req.params.id } })
            .then(user => res.status(200).json('user deleted'))
            .catch(err => res.status(500).json({ error: err, message: 'user not deleted' }))
    }
    else { res.status(500).json("Only Main Admin Account can delete other accounts") }
})


//edit budget info::
//create file
router.post('/uploaddocument', (req, res) => {
    if (req.body.fileType != 'application/pdf') { res.status(500).json('File upload must be PDF') }
    else {
        Budget.create({
            owner_id: req.user.id,
            fileName: req.body.fileName,
            documentType: req.body.documentType,
            description: req.body.description,
            fileDate: req.body.fileDate,
            fileType: req.body.fileType,
            fileBinary: req.body.data
        })
            .then(post => res.status(200).json(post), err => { res.status(400).json({ message: "notNullError", error: err })})
            .catch(err => res.status(500).json(err), r => res.status(405).json(r))

    }
})
//update file
router.put('/updatebudgetfile/:id', (req, res) => {
    Budget.update(req.body, { where: { id: req.params.id } })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json({ error: err, message: 'file not updates' }))
})
//delete file
router.delete('/deletebudgetfile/:id', (req, res) => {
    Budget.destroy({ where: { id: req.params.id } })
        .then(response => res.status(200).json('File Deleted'))
        .catch(err => res.status(500).json({ error: err, message: 'file not deleted' }))
})

//edit meetings and events info::
//create new
router.post('/createevent', (req, res) => {
    if (req.body.fileType != 'application/pdf' && req.body.fileType != "No file") { res.status(500).json('File upload must be PDF') }
    else {
        Event.create({
            owner_id: req.user.id,
            title: req.body.title,
            forumMessage: req.body.forumMessage,
            dateOfEvent: req.body.dateOfEvent,
            timeOfEvent: req.body.timeOfEvent,
            type: req.body.type,
            streetAddress: req.body.streetAddress,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.zipcode,
            fileBinary: req.body.fileBinary,
            fileType: req.body.fileType
        })
            .then(response => res.status(200).json(response), err => res.status(400).json(err))
            .catch(err => res.status(500).json({ error: err, message: "create event" }), ugh => console.log(ugh))
    }
})
//edit one
router.put('/editevent/:id', (req, res) => {
    Event.update(req.body, { where: { id: req.params.id } })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json(err))
})
//delete one
router.delete('/deletepost/:id', (req, res) => {
    Event.destroy({ where: { id: req.params.id } })
        .then(response => res.status(200).json('Post Deleted'))
        .catch(err => res.status(500).json({ error: err, message: 'Post not deleted' }))
})

module.exports = router;