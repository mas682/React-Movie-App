

// function to send GET requests to the api that return
// a json object
const apiGetJsonRequest = (url) =>
{
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

    console.log(requestOptions);

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
