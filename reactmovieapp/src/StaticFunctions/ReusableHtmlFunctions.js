import React from 'react';

const  generateInput = (config, style) =>
{
    let result = "";
    let disabled = (config.disabled !== undefined) ? config.disabled : false;
    let autocomplete = (config.autocomplete !== undefined) ? config.autocomplete : "on";
    // allows you to pass in multiple classes if you want to
    // needs to be formatted such as `${style.class1}...`
    let inputStyle = (config.inputStyle !== undefined) ? config.inputStyle : `${style.inputBoxStyle}`;
    let errorTextStyle = (config.errorTextStyle !== undefined) ? config.errorTextStyle : `${style.inputErrorText}`;
    if(config.error)
    {
        result = (
            <React.Fragment>
                <div className={style.inputHeader}>
                    <h3 className={`${style.inputH3Header} errorLabel`}>{config.label}</h3>
                </div>
                <input
                    type={config.type}
                    name={config.name}
                    form={config.form}
                    value={config.value}
                    disabled={disabled}
                    autocomplete={autocomplete}
                    className={`inputFieldBoxLong inputBoxError ` + inputStyle}
                    onChange={config.changeHandler}
                    maxLength={config.maxLength}
                />
                <small className={`errorTextSmall ` + errorTextStyle}>{config.error}</small>
            </React.Fragment>
        );
    }
    else
    {
        result = (
            <React.Fragment>
                <div className={style.inputHeader}>
                    <h3 className={`${style.inputH3Header}`}>{config.label}</h3>
                </div>
                <input
                    type={config.type}
                    name={config.name}
                    form={config.form}
                    value={config.value}
                    disabled={disabled}
                    autocomplete={autocomplete}
                    className={`inputFieldBoxLong validInputBox ` + inputStyle}
                    onChange={config.changeHandler}
                    maxLength={config.maxLength}
                />
            </React.Fragment>
        );
    }
    return result;
}

export {generateInput};