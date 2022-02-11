import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';


function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { name, email, password } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            updateProfile(auth.currentUser, {
                displayName: name
            });

            const formDataCopy = { ...formData };
            delete formDataCopy.password;
            formDataCopy.timeStamp = serverTimestamp();

            await setDoc(doc(db,'users',user.uid),formDataCopy)

            navigate('/');

        } catch (err) {
            toast.error('Something went wrong with registration');
        }
    }

    return (
        <>
            <div className="page-container">
                <header>
                    <p>Welcome Back</p>
                </header>

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        className="nameInput"
                        placeholder="Name"
                        id="name"
                        value={name}
                        onChange={onChange}
                    />
                    <input
                        type="email"
                        className="emailInput"
                        placeholder="Email"
                        id="email"
                        value={email}
                        onChange={onChange}
                    />
                    <div className="passwordInputDiv">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="passwordInput"
                            placeholder="Password"
                            id="password"
                            value={password}
                            onChange={onChange}
                        />
                        <img src={visibilityIcon} alt="show Password"
                            className="showPassword" onClick={() => setShowPassword((prevState) => !prevState)} />
                    </div>
                    <Link to="/forgot-password" className="forgotPasswordLink">
                        Forgot Password
                    </Link>
                    <div className="signUpBar">
                        <p className="signUpText">
                            Sign Up
                        </p>
                        <button className="signUpButton">
                            <ArrowRightIcon fill="#fff" width="34px" height="34px" />

                        </button>
                    </div>
                </form>
                <OAuth/>
                <Link to="/sign-in" className="registerLink">
                    Sign In Instead
                </Link>
            </div>
        </>
    );
}

export default SignUp;
