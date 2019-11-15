let express = require('express');
let router = express.Router();
let sequelize = require('../db');
const Budget = sequelize.import('../models/documents');

//get current budget file
router.get('/alldocuments', (req, res) => {
    Budget.findAll({ order: [['fileDate', 'DESC']] })
        .then(info => {
            res.status(200).json(info)
        })
        .catch(err => res.status(500).json(err))
})
//get by year
router.get('/document/:id', (req, res) => {
    Budget.findOne({ where: { id: req.params.id } })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json(err))
})

module.exports = router;