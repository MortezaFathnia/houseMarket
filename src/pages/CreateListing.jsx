import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import {db} from '../firebase.config';


function CreateListing() {
  const [geolocationEnabled, SetGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  });
  const { type, name, bedrooms, bathrooms, parking, furnished,
    address, offer, regularPrice, discountedPrice, images, longitude, latitude } = formData
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, useRef: user.uid })
        } else {
          navigate('/sign-in');
        }
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  if (loading) {
    return <Spinner />
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    console.log(formData)
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted Price needs to be less then regular price');
      return
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images')
      return
    }

    let geolocation = {};

    let location

    if (geolocationEnabled) {
      const response = await fetch(`
      https://maps.googleapis.com/maps/api/geocode/json?
      address=${address}&
      key=${process.env.REACT_APP_GEOCODE_API_KEY}`);

      const data = response.json();
      
      geolocation.lat=data.result[0]?.geometry.location.lat ?? 0

      geolocation.lng=data.result[0]?.geometry.location.lng ?? 0

      location=data.status==='ZERO_RESULTS'?undefined:data.results[0]?.formatted_Address;

      if(location===undefined || location.includes('undefined')){
        setLoading(false);
        toast.error('Please enter a correct address');
        return
      }

    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      location = address;
    }
  


    //store image in firebase
    const storeImage=async(image)=>{
      return new Promise((resolve,reject)=>{
        const storage=getStorage();
        const fileName=`${auth.currentUser.uid}-${image.name}-{uuidv4()}`;
        const storageRef=ref(storage,'images/'+fileName);
        const uploadTask=uploadBytesResumable(storageRef,image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }
    const imgUrls= await Promise.all(
      [...images].map((image)=>storeImage(image))
    ).catch(()=>{
      setLoading(false);
      toast.error('images not uploaded');
      return
    })
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = e => {
    let boolean = null;
    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    //files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }))
    }
    console.log(images)
    //text/number/boolean
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <div>
            <label className='formLabel'>Name</label>
            <input
              className='formInputName'
              type='text'
              id='name'
              value={name}
              onChange={onMutate}
              maxLength='32'
              minLength='10'
              required
            />
          </div>

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>
                Bedrooms
              </label>
              <input
                className='formInputSmall'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                type="number" />
            </div>
            <div>
              <label className='formLabel'>
                Bathrooms
              </label>
              <input
                className='formInputSmall'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                type="number" />
            </div>
          </div>
          <label className='formLabel'>
            Parking
          </label>
          <div className='formButtons'>
            <button
              type='button' id='parking' value={true}
              className={parking ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}>
              Yes
            </button>
            <button
              type='button' id='parking' value={false}
              className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}>
              No
            </button>
          </div>
          <label className='formLabel'>
            Furnished
          </label>
          <div className='formButtons'>

            <button
              type='button' id='furnished' value={true}
              className={furnished ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}>
              Yes
            </button>
            <button
              type='button' id='furnished' value={false}
              className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}>
              No
            </button>
          </div>
          <div>
            <label className='formLabel'>Address</label>
            <textarea
              className='formInputAddress'
              id='address'
              value={address}
              onChange={onMutate}
              required
            />
          </div>
          {!geolocationEnabled && (
            <div className='formLatlng flex'>
              <div>
                <label className='formLabel'>
                  Latitude
                </label>
                <input
                  className='formInputSmall'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  type="number"
                  required />
              </div>
              <div>
                <label className='formLabel'>
                  Longitude
                </label>
                <input
                  className='formInputSmall'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  type="number"
                  required />
              </div>
            </div>)}
          <div>
            <label className='formLabel'>
              Offer
            </label>
            <div className='formButtons'>
              <button
                type='button' id='offer' value={true}
                className={offer ? 'formButtonActive' : 'formButton'}
                onClick={onMutate}>
                Yes
              </button>
              <button
                type='button' id='offer' value={false}
                className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
                onClick={onMutate}>
                No
              </button>
            </div>
          </div>
          <div className='formPriceDiv'>
            <label className='formLabel'>Regular Price</label>
            <input
              className='formInputSmall'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='75000000'
              type="number"
              required />
            {type === 'rent' && (<p className='formPriceText'>$ / Month</p>)}
          </div>
          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='75000000'
                type="number"
                required />
            </>
          )}
          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            id='file'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            type="file"
            multiple
            required />
          <button type='submit' className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main >
    </div >
  )
}

export default CreateListing