const Logger = require("../shared/logger.js").getLogger();
const caughtErrorHandler = require("../shared/ErrorFunctions.js").caughtErrorHandler;
const appendCallerStack = require("../shared/ErrorFunctions.js").appendCallerStack;



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
        },
        suspendedAt: {
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
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        catch(err)
        {
            // only remove if just created
            if(removeUser)
            {
                await user.destroy().catch(error=>{
                    let callerStack = new Error().stack;
                    error = appendCallerStack(callerStack, error, undefined, false);
                    let message = "Some unexpected error occurred when trying to remove a user";
                    caughtErrorHandler(error, req, res, errorCode, message);
                });
            }
            // throw first error that occurred
            throw err;
        }      
        return result;
    };

    UserAuthenticationAttempts.updateVerificationAttempts = async(userId) =>
    {
        // increment user password reset attempts, db handles logic around it to lock or not
        let result = await UserAuthenticationAttempts.increment("verificationAttempts",
            {where: {userId: userId}}); 

        let updatedRecord;
        let updated = true;
        // if user not found
        if(result !== null && result[0][0].length < 1)
        {
            updatedRecord = undefined;
            updated = false;
        }
        // update failed for some reason
        else if(result !== null && result[0][1] != 1)
        {
            updated = false;
            updatedRecord = result[0][0][0];
        }
        else
        {
            updatedRecord = result[0][0][0];
        }
        return {updated: updated, record: updatedRecord};
    }

    // function to increment user login attempts
    UserAuthenticationAttempts.updateUserLoginAttempts = async (req, res, id, username, errorCode, catchError) => {
        let result = 0;
        try
        {
            result = await UserAuthenticationAttempts.increment(
                "passwordAttempts",{where: {userId: id}}).catch(error=>{
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, error, undefined, true);
                }); 
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
            if(catchError)
            {
                let message = "Some unknown error occurred updaing the users(" + username + ") account on login failure";
                caughtErrorHandler(err, req, res, errorCode, message);
            }
            else
            {
                throw err;
            }
        }
        return result;
    }

    return UserAuthenticationAttempts;
};

export default userAuthenticationAttempts;