// function to convert time in format 2021-10-18T18:39:49.795Z to EST time
const convertUTCtoESTString = (date) =>
{
    let d = new Date(date);
    return d.toLocaleString('en-US',{month: 'long',day: 'numeric',year: 'numeric',hour: 'numeric',minute: 'numeric'});
}

export {convertUTCtoESTString};