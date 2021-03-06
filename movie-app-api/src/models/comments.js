let moment = require('moment');
const comment = (sequelize, DataTypes) => {
    const Comment = sequelize.define('comment',
    {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        // create a username field
        value: {
            // set the data type to string
            type: DataTypes.TEXT,
            // do not allow this to be empty
            allowNull: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        reviewId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'reviews',
            key: 'id'
          }
        },
        createdAt: {
            // this is done to format the date on return
            type: DataTypes.DATE,
            defaultValue: moment(),
            allowNull: false,
            get() {
                let hour = this.getDataValue('createdAt').getHours();
                let amPm = "AM";
                if(hour >= 12)
                {
                    amPm = "PM";
                }
                return moment(this.getDataValue('createdAt')).format('MMMM DD, YYYY h:mm ') + amPm;
            }
        },
        updatedAt: {
            // this is done to format the date on return
            type: DataTypes.DATE,
            get() {
                let hour = this.getDataValue('updatedAt').getHours();
                let amPm = "AM";
                if(hour >= 12)
                {
                    amPm = "PM";
                }
                return moment(this.getDataValue('updatedAt')).format('MMMM DD, YYYY h:mm ') + amPm;
            },
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: 'comments',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "comments_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
        ]
    });

    // associate bad tags with reviews
    // each tag can belong to many reviews
    Comment.associate = models => {
        Comment.belongsTo(models.Review, {onDelete: 'CASCADE', foreignKey: "reviewId"});
        Comment.belongsTo(models.User, {onDelete: 'CASCADE', foreignKey: "userId"});
    };

    // function to get comments for a review post
    Comment.findByReview = async (models, id) =>
    {
        let comments = await Comment.findAll({
            where: {id: id},
            attributes:["id", "value", "createdAt"],
            order: [["createdAt", 'ASC']],
            include:[
                {
                    model: models.User,
                    attributes: ["username"]
                }
            ]
        });
        return comments;
    };

    // function to get a comment and the user that created it
    Comment.findById = async (models, id) =>
    {
        let comment = await models.Comment.findOne({
            where: {id: id},
            attributes:["id", "value", "createdAt", "reviewId"],
            include:[
                {
                    model: models.User,
                    attributes: ["username"]
                }
            ]
        });
        return comment;
    };

    return Comment;
};

export default comment;
