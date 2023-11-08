import constants from './constants';

//set typescript return types to boolean for the function
const isLoggedIn = async (redirect, url) => {
    const endpoint = url ? `${constants.url}/${url}` : `${constants.url}/auth/isloggedin`;
    if (!window.localStorage.getItem(constants.authToken)){
        if (redirect) {
            window.location.href = redirect;
        }
        return false;
    }
    //fetch the api to check if the user is logged in with the token
    const res = await fetch(`${endpoint}`, {
        //@ts-ignore
        headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }
    });
    const data = await res.json();
    if (res.ok) {
        return data;
    }
    window.localStorage.removeItem(constants.authToken);
    if (redirect) {
        window.location.href = redirect;
    }
    return false;
}


export default isLoggedIn;