import { LoginWithGoogle } from './Firebase'

export default function LoginView({ setCurrentUser }) {

    function handleGoogleLogin() {
        LoginWithGoogle((res) => {

            const userDisplayName = res.user.displayName;

            console.log("Logging in " + userDisplayName);

        });
    }

    return (
        <>
            <button onClick={handleGoogleLogin}>Login With Google</button>
        </>
    )

}