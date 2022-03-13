import { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../firebase.config';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

function Profile() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [changeDetails, setChangeDetails] = useState(false);

    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    });

    const { name, email } = formData;
    const onLogout = () => {
        auth.signOut();
        navigate('/');
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (auth.currentUser.displayName !== name) {
                //update display name in fb
                await updateProfile(auth.currentUser, {
                    displayName: name
                });

                //update in firestore
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, {
                    name
                })
            }
        } catch (error) {
            toast.error('Could not update profile details')
        }
    }

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    return (
        <div>
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type='button' className='logOut' onClick={onLogout}>
                    Logout
                </button>
            </header>

            <main>
                <div className="profileDetailsHeader">
                    <p className="personalDetailsText">Personal Details</p>
                    <p className="personalDetails" onClick={() => {
                        changeDetails && onSubmit();
                        setChangeDetails((prevState) => !prevState)
                    }}>
                        {changeDetails ? 'done' : 'change'}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                        <input
                            type='text'
                            id='name'
                            className={!changeDetails ? 'profileName' : 'profileNameActive'}
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            type='text'
                            id='email'
                            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                        />
                    </form>
                </div>
                <Link to="/create-listing" className="createListing">
                    <img src={homeIcon} alt="home" />
                    <p>Sell or rent home</p>
                    <img src={arrowRight} alt="arrow right" />
                </Link>
            </main>
        </div>
    );
}

export default Profile;
