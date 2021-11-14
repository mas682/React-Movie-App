import {customAlphabet} from 'nanoid';
const nanoid = customAlphabet('1234567890', 6);
import {hash} from '../shared/crypto.js';
const Logger = require("../shared/logger.js").getLogger();

const tempVerificationCodes = (sequelize, DataTypes) => {
    const TempVerificationCodes = sequelize.define('TempVerificationCodes', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
              model: 'Users',
              key: 'id'
            }
        },
        type: {
            type: DataTypes.INTEGER
        },
        salt: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        verificationAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        expiresAt: {
          type: DataTypes.DATE
        },
        createdAt: {
          type: DataTypes.DATE
        }
      },
      {
        sequelize,
        tableName: 'TempVerificationCodes',
        schema: 'public',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "TempVerificationCodes_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
        ]
    });

    TempVerificationCodes.associate = models => {
        TempVerificationCodes.belongsTo(models.Users, {foreignKey: "id", as: "verificationCode"});
    };

    // function to generate temp verification code for temp user
    // user is a user object
    // errorCodes is a dictionary with 2 keys: saltError and unexpectedError
    // removeUser is a boolean to remove the user if an error occurred
    // duration is the number of minutes the code is valid for
    // type is the integer representing the type of verification code
    TempVerificationCodes.generateTempVerificationCode = async (req, res, user, errorCodes, removeUser, duration, type) =>
    {
        let code;
        let date;
        let createdDate;
        let secret;
        let result;
        let expirationDate;
        let errorObject;
        let errorType;
        let throwError;
        let errorCode;
        let counter = 0;

        // delete any existing verification records for the user
        await TempVerificationCodes.destroy({where: {userId: user.id}});
        while(counter < 5)
        {
            code = nanoid();
            date = new Date();
            createdDate = date.toISOString();
            secret = code + Date.parse(date);
            result = hash(secret, "verificationCode");
            expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + duration);
            try 
            {
                result = await TempVerificationCodes.create({
                    userId: user.id,
                    type: type,
                    salt: result.salt,
                    code: result.value,
                    createdAt: createdDate,
                    expiresAt: expirationDate.toISOString()
                });
                break;
            }
            catch (err)
            {
                errorObject = JSON.parse(JSON.stringify(err));
                errorType = errorObject.name;
                throwError = false;
                if(errorType !== undefined && errorType.includes("Sequelize"))
                {
                    if(!(err.name.includes("UniqueConstraint") &&
                    errorObject.original.constraint === "TempVerificationCodes_salt_key") || counter >= 4)
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
                    }
                    // throw first error that occurred
                    throw err;
                }
            }
            counter = counter + 1;
        }
        return {tempVerificationCode: result, code: code};
    };

    return TempVerificationCodes;
};

export default tempVerificationCodes;
