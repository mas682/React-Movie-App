

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

const api2 = () =>
{

};

export {apiGetJsonRequest, apiPostTextRequest};
