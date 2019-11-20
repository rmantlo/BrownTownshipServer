let express = require('express');
let router = express.Router();
let sequelize = require('../db');
const Budget = sequelize.import('../models/documents');
let Op = require('sequelize').Op;


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
//search by type
router.get('/search/:documentType', (req, res) => {
    console.log(req.params.documentType)
    Budget.findAll({ where: { documentType: req.params.documentType } }, { order: [['fileDate', 'DESC']] })
        .then(info => res.status(200).json(info))
        .catch(err => res.status(500).json(err))

})
//search by date (with surrounding dates)
router.get('/searchdate/:fileDate', (req, res) => {
    let date = req.params.fileDate;
    console.log(new Date(date).toLocaleDateString())
    Budget.findAll({
        where: {
            fileDate: {
                [Op.lte]: new Date(date)
            }
        }
    }, { order: [['fileDate', 'DESC']] })
    .then(info => res.status(200).json(info))
    .catch(err => res.sendStatus(500).json(err))
})

module.exports = router;