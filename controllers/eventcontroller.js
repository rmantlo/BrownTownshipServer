let express = require('express');
let router = express.Router();
let sequelize = require('../db');
const Event = sequelize.import('../models/events');
let Op = require('sequelize').Op;

//get upcoming events to display
router.get('/getupcomingevents', (req, res) => {
    Event.findAll({
        where: {
            dateOfEvent: {
                [Op.gte]: new Date()
            },
        },
        order: [['dateOfEvent', 'ASC'], ['timeOfEvent', 'ASC']]
    })
        .then(response => res.status(200).json(response))
        .catch(err => res.status(500).json(err))
})

//get next up coming meeting
router.get('/nextmeeting', (req, res) => {
    Event.findOne({
        where: {
            dateOfEvent: {
                [Op.gte]: new Date()
            }
        }
    })
        .then(response => res.status(200).json(response))
        .catch(err => res.status(500).json(err))
})
module.exports = router;