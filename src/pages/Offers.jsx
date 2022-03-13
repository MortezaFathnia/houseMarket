import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';

import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Offers() {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                //Get Reference
                const listingsRef = collection(db, 'listings');

                //create query
                const q = query(
                    listingsRef,
                    where('offer', '==', true),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );

                //execute query
                const querySnap = await getDocs(q);

                let listings = [];

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                setListings(listings);
                setLoading(false);

            } catch (error) {
                console.log(error)
                toast.error('Could not fetch listings');
            }
        };
        fetchListings();
    }, [])
    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    Offers
                </p>
            </header>
            {loading ? (<Spinner />) : listings && listings.length > 0 ?
                (
                    <>
                        <main>
                            <ul className='categoryListings'>
                                {listings.map((listing) => (
                                      <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
                                ))}
                            </ul>
                        </main>
                    </>
                ) : (<p>No listings for offers</p>)}
        </div>
    );
}

export default Offers;