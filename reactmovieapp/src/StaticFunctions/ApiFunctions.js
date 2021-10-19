
import config from './Config';

// function to send GET requests to the api that return
// a json object
const apiGetJsonRequest = (url) =>
{
    url = config.api.url + url;
    const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'},
    };

    let status = 0;
    return fetch(url, requestOptions)
        .then(res => {
            status = res.status;
            return res.json();
        }).then(result =>{
            return [status, result];
        });
};

const apiPostTextRequest = (url, parameters) =>
{
    url = config.api.url + url;
    const requestOptions = {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(
            parameters
        )
    };

    let status = 0;
    return fetch(url, requestOptions)
        .then(res => {
            status = res.status;
            return res.text();
        }).then(result =>{
            return [status, result];
        });
};

const apiPostJsonRequest = (url, parameters, headers, json) =>
{
    url = config.api.url + url;
    headers = (headers === undefined) ? { 'Content-Type': 'application/json'} : headers;
    let requestOptions;
    if(json === undefined || json)
    {
        requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: JSON.stringify(
                parameters
            )
        };
    }
    else
    {
        requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: parameters
        };
    }

    let status = 0;
    return fetch(url, requestOptions)
        .then(res => {
            status = res.status;
            return res.json();
        }).then(result =>{
            return [status, result];
        });
};

const apiDeleteJsonRequest = (url) =>
{
    url = config.api.url + url;
    const requestOptions = {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'},
    };

    let status = 0;
    return fetch(url, requestOptions)
        .then(res => {
            status = res.status;
            return res.json();
        }).then(result =>{
            return [status, result];
        });
};

export {apiGetJsonRequest, apiPostTextRequest, apiPostJsonRequest, apiDeleteJsonRequest};
