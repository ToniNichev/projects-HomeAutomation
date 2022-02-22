export const Poster = async (url = '', data = {}) => {
    /* Express throws CORS errror on Content-Type: application/json.
    The solution is to add body-parser and send stringified JSON */

    const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain' },
    body: JSON.stringify(data)
    });
    return  response.json(); // parses JSON response into native JavaScript objects
}

export default Poster;