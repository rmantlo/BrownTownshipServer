let express = require('express');
let router = express.Router();
let sequelize = require('../db');
const Budget = sequelize.import('../models/budgetFiles');

//get current budget file
router.get('/currentbudget', (req, res) => {
    Budget.findOne({ where: { current: true } })
        .then(info => {
            res.status(200).json(info)
        })
        .catch(err => res.status(500).json(err))
})
//get by year
router.get('/year/:year', (req, res) => {
    Budget.findOne({ where: { fileYear: req.params.year } })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json(err))
})

module.exports = router;