module.exports = function (sequelize, DataTypes) {
    return sequelize.define('budgetfile', {
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileYear: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        documentDesc: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        current: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        fileBinary:{
            type: DataTypes.TEXT,
            allowNull: true
        }
    })
}