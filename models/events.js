module.exports = function (sequelize, DataTypes) {
    return sequelize.define('post', {
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        forumMessage: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        dateOfEvent: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        timeOfEvent: {
            type: DataTypes.TIME,
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM,
            values: ['Event', 'Meeting']
        },
        streetAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zipcode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}