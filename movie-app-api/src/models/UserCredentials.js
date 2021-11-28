import {hash} from '../shared/crypto.js';
const Logger = require("../shared/logger.js").getLogger();
const caughtErrorHandler = require("../shared/ErrorFunctions.js").caughtErrorHandler;
const appendCallerStack = require("../shared/ErrorFunctions.js").appendCallerStack;

const userCredentials = (sequelize, DataTypes) => { 
    const UserCredentials = sequelize.define('UserCredentials', {
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
        password: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        salt: {
            type: DataTypes.STRING(44),
            allowNull: false
        }
    }, 
    {
        sequelize,
        tableName: 'UserCredentials',
        schema: 'public',
        timestaps: true,
        indexes: [
            {
                name: "UserCredentials_pkey",
                unique: true,
                fields: [
                    { name: "userId" }
                ]
            },
            {
                name: "UserCredentials_salt_key",
                unique: true,
                fields: [
                  { name: "salt" },
                ]
              },
        ]
    });

    UserCredentials.associate = models => {
        UserCredentials.belongsTo(models.Users, {as: "credentials", onDelete: 'CASCADE', foreignKey: "userId"});
    }

    // function to create or update a users credential record
    // user is a user object
    // password is the new password
    // removeUser is a boolean to remove the user if an error occurs
    // errorCodes is a dictionary with 2 keys: saltError and unexpectedError
    // create is a boolean value for whether to create the record or update existing
    UserCredentials.createOrUpdatePassword = async(req, res, user, password, removeUser, errorCodes, create) => {
        let result;
        let counter = 0;
        let userCreds;
        let errorObject;
        let errorType;
        let throwError;
        let errorCode;
        while(counter < 5)
        {
            result = hash(password, "password");
            try
            {
                if(create)
                {
                    userCreds = await UserCredentials.create({
                        password: result.value,
                        salt: result.salt,
                        userId: user.id
                    }).catch(error=>{
                        let callerStack = new Error().stack;
                        appendCallerStack(callerStack, error, undefined, true);
                    });
                }
                else
                {
                    await UserCredentials.findOrCreate({
                        password: result.value,
                        salt: result.salt,
                    },
                    {
                        where: { userId: user.id}
                    }).catch(error=>{
                        let callerStack = new Error().stack;
                        appendCallerStack(callerStack, error, undefined, true);
                    });
                }
                break;
            }
            catch(err)
            {
                errorObject = JSON.parse(JSON.stringify(err));
                errorType = errorObject.name;
                throwError = false;
                if(errorType !== undefined && errorType.includes("Sequelize"))
                {
                    if(!(err.name.includes("UniqueConstraint") &&
                    errorObject.original.constraint === "UserCredentials_salt_key") || counter >= 4)
                    {
                        throwError = true;
                        if(removeUser) errorCode = errorCodes.saltError;
                    }
                }
                else
                {
                    throwError = true;
                    if(removeUser) errorCode = errorCodes.unexpectedError;
                }
                // clean up and throw error
                if(throwError)
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
            }
            counter = counter + 1;
        }
        return userCreds;
    };


    return UserCredentials;
};

export default userCredentials;