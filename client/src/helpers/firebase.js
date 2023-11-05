import constants from '@/helpers/constants'
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = constants.firebaseConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const successfulLogin = (token) => {
    localStorage.setItem(constants.authToken, token);
    window.location.href = '/home';
};

const handleGoogle = async () => {
    signInWithPopup(auth, provider).then((result) => {
      console.log(result);
      fetch(`${constants.url}/accountCreation`, {
          method: 'POST',
          body: JSON.stringify({ idToken: result.user.uid, email: result.user.email, name: result.user.displayName }),
          headers: { 'Content-Type': 'application/json' }
      }).then(async (response) => {
        const data = await response.json();
        if (response.ok) {
            console.log('ok response');
            successfulLogin(data.token);
        } else {
            console.log('not ok response');
            setError(data.message);
        }
      }).catch((error) => {
          setError('There was an error logging in with Google');
      });
      })
      .catch((error) => {
          setError('There was an error logging in with Google');
      });
};

export default handleGoogle;