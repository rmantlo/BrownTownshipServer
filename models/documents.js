module.exports = function (sequelize, DataTypes) {
    return sequelize.define('document', {
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        documentType: {
            type: DataTypes.ENUM,
            values: ['Budget', 'Minutes', 'Resolutions', 'Reports', 'Other']
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fileDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileBinary: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    })
}