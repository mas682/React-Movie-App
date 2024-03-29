const appendCallerStack = require("../shared/ErrorFunctions.js").appendCallerStack;

const comment = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comments',
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
            type: DataTypes.STRING(1000),
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
            allowNull: false
        },
        updatedAt: {
            // this is done to format the date on return
            type: DataTypes.DATE
        },
    },
    {
        sequelize,
        tableName: 'Comments',
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
        Comment.belongsTo(models.Reviews, {onDelete: 'CASCADE', foreignKey: "reviewId"});
        Comment.belongsTo(models.Users, {onDelete: 'CASCADE', foreignKey: "userId"});
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
                    model: models.Users,
                    attributes: ["username"]
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return comments;
    };

    // function to get a comment and the user that created it
    Comment.findById = async (models, id) =>
    {
        let comment = await models.Comments.findOne({
            where: {id: id},
            attributes:["id", "value", "createdAt", "reviewId"],
            include:[
                {
                    model: models.Users,
                    attributes: ["username"]
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return comment;
    };

    return Comment;
};

export default comment;
