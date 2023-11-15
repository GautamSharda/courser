import constants from '@/helpers/constants'
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = constants.firebaseConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const successfulLogin = (token) => {
    localStorage.setItem(constants.authToken, token);
    window.location.href = '/my-chatbots';
};


//async version of handleGoogle
const handleGoogle = async (errorHandler) => {
    try {
        const emptyFunction = (_) => {};
        var setError = errorHandler || emptyFunction;
        const result = await signInWithPopup(auth, provider);
        const response = await fetch(`${constants.url}/auth/google`, {
            method: 'POST',
            body: JSON.stringify({ idToken: result.user.uid, email: result.user.email, name: result.user.displayName }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const data = await response.json();
            successfulLogin(data.token);
        } else if (response.status === 409) {
            setError("An account with this email already exists.");
        } else {
            setError('There was an error logging in with Google.');
        }
    } catch (error) {
        setError('There was an error logging in with Google.');
    }
}


// const handleGoogle = async (errorHandler) => {
//     const emptyFunction = (_) => {};
//     var setError = errorHandler || emptyFunction;
//     signInWithPopup(auth, provider).then((result) => {
//       console.log(result);
//       fetch(`${constants.url}/auth/google`, {
//           method: 'POST',
//           body: JSON.stringify({ idToken: result.user.uid, email: result.user.email, name: result.user.displayName }),
//           headers: { 'Content-Type': 'application/json' }
//       }).then(async (response) => {
//         const data = await response.json();
//         if (response.ok) {
//             successfulLogin(data.token);
//         } else {
//             setError(data.message);
//         }
//       }).catch((error) => {
//           setError('There was an error logging in with Google');
//       });
//       })
//       .catch((error) => {
//           setError('There was an error logging in with Google');
//       });
// };

export { handleGoogle, successfulLogin };