import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
console.log(122)
export const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(true);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const isMounted = useRef(true);
    console.log(34)
    useEffect(() => {
        console.log(isMounted);
        if (isMounted) {
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log(user)
                    setLoggedIn(true);
                }
                setCheckingStatus(false);
            })
        }

        return () => {
            isMounted.current = false
        }

    },[isMounted])

    return { loggedIn, checkingStatus }
}
