const Logger = require("../shared/logger.js").getLogger();

const userAuthenticationAttempts = (sequelize, DataTypes) => { 
    const UserAuthenticationAttempts = sequelize.define('UserAuthenticationAttempts', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            primaryKey: true
        },
        verificationAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        passwordAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastLogin: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        verificationLocked: {
            type: DataTypes.DATE
        },
        passwordLocked: {
            type: DataTypes.DATE
        }
    }, 
    {
        sequelize,
        tableName: 'UserAuthenticationAttempts',
        schema: 'public',
        timestaps: true,
        indexes: [
            {
                name: "UserAuthenticationAttempts_pkey",
                unique: true,
                fields: [
                    { name: "userId" }
                ]
            },
        ]
    });

    UserAuthenticationAttempts.associate = models => {
        UserAuthenticationAttempts.belongsTo(models.Users, {as: "authenticationAttempts", onDelete: 'CASCADE', foreignKey: "userId"});
    }



    // function to create or update a users authentication attempts record
    // user is a user object
    // removeUser is a boolean to remove the user if an error occurs
    // errorCodes is a  int
    UserAuthenticationAttempts.createNewUserRecord = async(req, res, user, removeUser, errorCode) => {
        let result;
        try
        {
            result = await UserAuthenticationAttempts.create({
                userId: user.id,
                lastLogin: null
            });
        }
        catch(err)
        {
            // only remove if just created
            if(removeUser)
            {
                try
                {
                    await user.destroy();
                }
                catch (error)
                {
                    let errorObject = JSON.parse(JSON.stringify(error));
                    Logger.error("Some unexpected error occurred when trying to remove a user",
                        {errorCode: errorCode, function: res.locals.function, file: res.locals.file, requestId: req.id, error: errorObject});
                }
                // throw first error that occurred
                throw err;
            }
        }      
        return result;
    };

    // function to increment user login attempts
    UserAuthenticationAttempts.updateUserLoginAttempts = async (req, res, id, username, errorCode) => {
        let result = 0;
        try
        {
            result = await UserAuthenticationAttempts.increment(
                "passwordAttempts",{where: {userId: id}}); 
            if(result[0][0].length < 1)
            {
                // if no user found, return 0
                result = 0;
            }
            else
            {
                // result[0][1] indicates succcess/failure but either way return this
                result = result[0][0][0].passwordAttempts
            }
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            Logger.error("Some unknown error occurred updaing the users(" + username + ") account on login failure: " + errorObject.name,
            {errorCode: errorCode, function: res.locals.function, file: res.locals.file, requestId: req.id, error: errorObject})
        }
        return result;
    }

    return UserAuthenticationAttempts;
};

export default userAuthenticationAttempts;