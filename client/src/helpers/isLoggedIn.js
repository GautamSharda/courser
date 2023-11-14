import constants from './constants';

//set typescript return types to boolean for the function
const isLoggedIn = async (redirect, url) => {
    const endpoint = url ? `${constants.url}/${url}` : `${constants.url}/auth/isloggedin`;
    console.log('attempting to fetch')
    if (!window.localStorage.getItem(constants.authToken)){
        if (redirect) {
            window.location.href = redirect;
        }
        return false;
    }
    
    //fetch the api to check if the user is logged in with the token
    console.log('about to go')
    console.log(endpoint);
    const res = await fetch(`${endpoint}`, {
        //@ts-ignore
        headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }
    });
    console.log('back');
    console.log(res);
    if (!res.ok) {
        window.localStorage.removeItem(constants.authToken);
        if (redirect) {
            window.location.href = redirect;
        }
        return false;
    }
    const data = await res.json();
    return data;
}


export default isLoggedIn;