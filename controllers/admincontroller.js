let express = require('express');
let router = express.Router();
let sequelize = require('../db');
let User = sequelize.import('../models/users');
let Budget = sequelize.import('../models/budgetFiles');
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
//get all budget files
router.get('/allbudgetfiles', (req, res) => {
    Budget.findAll({ order: [['fileYear', 'DESC']] })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json(err))
})
//create file
router.post('/uploadbudgetfile', (req, res) => {
    if (req.body.fileType != 'application/pdf') { res.status(500).json('File upload must be PDF') }
    else {
        if (req.body.current === true) {
            Budget.update({ current: false }, { where: { current: true } })
                .then()
                .catch(err => res.status(500).json({ error: err, message: "could not change current file to false." }))
        }

        Budget.findOne({ where: { fileYear: req.body.year } })
            .then(response => {
                if (response == null) {
                    Budget.create({
                        owner_id: req.user.id,
                        documentDesc: req.body.documentDesc,
                        current: req.body.current,
                        fileYear: req.body.year,
                        fileType: req.body.fileType,
                        fileName: req.body.fileName,
                        fileBinary: req.body.data
                    })
                        .then(post => res.status(200).json(post))
                        .catch(err => res.status(500).json(err))
                }
                else {
                    Budget.destroy({ where: { id: response.id } })
                        .then(info => {
                            Budget.create({
                                owner_id: req.user.id,
                                documentDesc: req.body.documentDesc,
                                current: req.body.current,
                                fileYear: req.body.year,
                                fileType: req.body.fileType,
                                fileName: req.body.fileName,
                                fileBinary: req.body.data
                            })
                                .then(post => res.status(200).json(post))
                                .catch(err => res.status(500).json(err))
                        })
                        .catch(err => res.status(500).json({ error: err, message: "File of same year exists but could not be deleted, therefore new file was not saved" }))
                }
            })
            .catch(err => res.status(500).json({ error: err, message: 'error through looking for file of same year' }));
    }
})
//update file
router.put('/updatebudgetfile/:id', (req, res) => {
    if (req.body.current === false) {
        Budget.update(req.body, { where: { id: req.params.id } })
            .then(info => res.status(200).json(info))
            .catch(err => res.status(500).json({ error: err, message: 'file not updates' }))
    }
    else {
        Budget.update({ current: false }, { where: { current: true } })
            .then(info => {
                Budget.update(req.body, { where: { id: req.params.id } })
                    .then(info => res.status(200).json(info))
                    .catch(err => res.status(500).json({ error: err, message: 'file not updates' }))
            })
            .catch(err => res.status(500).json({ error: err, message: 'previous current true file not changed to false' }))
    }
})
//delete file
router.delete('/deletebudgetfile/:id', (req, res) => {
    Budget.destroy({ where: { id: req.params.id } })
        .then(response => res.status(200).json('File Deleted'))
        .catch(err => res.status(500).json({ error: err, message: 'file not deleted' }))
})

//edit meetings and events info::
//get all created events (past and future)
router.get('/alleventposts', (req, res) => {
    let events = {
        pastEvents: [],
        futureEvents: []
    };
    Event.findAll({
        where: {
            dateOfEvent: {
                [Op.gte]: new Date()
            }
        },
        order: [['dateOfEvent', 'ASC'], ['timeOfEvent', 'ASC']]
    })
        .then(info => {
            events.futureEvents = info;
            Event.findAll({
                where: {
                    dateOfEvent: {
                        [Op.lt]: new Date()
                    }
                },
                order: [['dateOfEvent', 'DESC'], ['timeOfEvent', 'DESC']]
            })
                .then(info => {
                    events.pastEvents = info;
                })
                .then(info => res.status(200).json(events))
                .catch(err => res.status(500).json(err))
        })
        .catch(err => res.status(500).json(err))

})
//create new
router.post('/createevent', (req, res) => {
    Event.create({
        owner_id: req.user.id,
        title: req.body.title,
        forumMessage: req.body.message,
        dateOfEvent: req.body.date,
        timeOfEvent: req.body.time,
        type: req.body.type,
        streetAddress: req.body.location,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode
    })
        .then(response => res.status(200).json(response))
        .catch(err => res.status(500).json(err))
})
//get on by id
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