"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, getAdditionalUserInfo } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { checkForUserInDb } from "../firebase/functions";
import { doc, onSnapshot, query } from "firebase/firestore"; 
import { firestoreDb } from "../firebase/firebase";
import TokenApi from "../api/TokenApi";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [firebaseInfo, setFirebaseInfo] = useState({
        uid: null,
        latestDonation: null,
        upcomingDonation: null,
        email: null,
        allDonations: [],
    })

    // const updateWithFirebaseInfo = async (id) => {
    //     console.log(snapshotUserInformation(id));
    // }

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
          .then((result) => {
            const details = getAdditionalUserInfo(result);
            console.log(result);
            console.log(details);
            checkForUserInDb(result.user.uid, result.user.displayName, result.user.email);
            // TokenApi.token = someFirebaseToken;
            TokenApi.getUserData(result.user.uid);
            setFirebaseInfo((prevState) => ({
                ...prevState,
                uid: result.user.uid,
            }));
            // snapshotUserInformation(result.user.uid, firebaseInfo, setFirebaseInfo);
          })
        // .then(updateWithFirebaseInfo(firebaseInfo.uid))
          .catch((error) => {
            console.log(error);
          });
    }

    // let snapshotUserInfoUnsubscribe;

    // const snapshotUserInformation = (userId, stateObj, stateFxn) => {
    //     snapshotUserInfoUnsubscribe = onSnapshot(doc(firestoreDb, "users", userId), (doc) => {
    //         console.log("Current data: ", doc.data());
    //         stateFxn((stateObj) => ({
    //             ...stateObj,
    //             latestDonation: doc.data().latestDonation,
    //             upcomingDonation: doc.data().upcomingDonation,
    //             allDonations: doc.data().allDonations,
    //         }))
    //     });
    // }

    // const cancelSnapshotListener = () => {
    //     off(snapshotUserInfoUnsubscribe)
    // }

    const userSignOut = () => {
        signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("currentUser is ", currentUser);
            setUser(currentUser);
        })
        return () => unsubscribe();
    }, [user])

    useEffect(() => {
        if (user !== null) {
            const snapshotUserInfoUnsubscribe = onSnapshot(doc(firestoreDb, "users", user.uid), (doc) => {
                console.log("Current data: ", doc.data());
                if (doc.data()) {
                    let tempLatest, tempUpcoming, tempEmail, tempName = null;
                    if (doc.data().latestDonation) {
                        tempLatest = doc.data().latestDonation.toDate();
                    } 
                    if (doc.data().upcomingDonation) {
                        tempUpcoming = doc.data().upcomingDonation.toDate();
                    } 
                    if (doc.data().email) {
                        tempEmail = doc.data().email;
                    }
                    if (doc.data().name) {
                        tempName = doc.data().name;
                    }
                    setFirebaseInfo((firebaseInfo) => ({
                        ...firebaseInfo,
                        uid: user.uid,
                        name: tempName,
                        latestDonation: tempLatest,
                        upcomingDonation: tempUpcoming,
                        email: tempEmail,
                        allDonations: doc.data().allDonations,
                    }))
                }
            });

            return () => snapshotUserInfoUnsubscribe();
        }
    }, [user])

    useEffect(() => {
        console.log("firebaseInfo has changed, it's now: ", firebaseInfo);
    }, [firebaseInfo])

    return (
        <AuthContext.Provider value={{user, googleSignIn, userSignOut, firebaseInfo, setFirebaseInfo, firebaseInfo}}>{children}</AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}