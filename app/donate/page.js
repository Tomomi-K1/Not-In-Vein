"use client";
import { useState, useEffect} from "react";
import Past56SelectDate from "../components/Past56SelectDate";
import RecentlyDonatedSelectDate from "../components/RecentDonatedSelectDate";
import SelectDate from "../components/SelectDate";
import { add, setMilliseconds, setSeconds, setMinutes, setHours } from "date-fns";
import { UserAuth } from "../context/AuthContext";
import { addRecentDonation, addUpcomingForRecent, checkUpcomingDonation } from "../firebase/functions";

export default function Donate() {
    const {user} = UserAuth();
    const [donatedRecently, setDonatedRecently] = useState();
    const [donatedRecentlyDate, setDonatedRecentlyDate] = useState(new Date());
    const [scheduledDonationDate, setScheduledDonationDate] = useState(new Date());
    const [earliestPossDonation, setEarliestPossDonation] = useState(null);
    const [openScheduleDonatedRecently, setOpenScheduleDonatedRecently] = useState(false);
    const [scheduleDonatedRecently, setScheduleDonatedRecently] = useState(new Date());
    const [canConfirm, setCanConfirm] = useState(false);
    const [remindSchedule, setRemindSchedule] = useState(false);
    const [confirmedAptFadeOut, setConfirmedAptFadeOut] = useState(false);
    const [confirmedAptFadeIn, setConfirmedAptFadeIn] = useState(false);

    const cutDownDate = (longerDate) => {
        const wordsInArray = longerDate.toString().split(" ");
        const shorterDate = wordsInArray.slice().splice(0,1)+ ", " + wordsInArray.slice().splice(1,3).join(" ");
        return shorterDate
    }

    //for those who donated recently, when they can donate again
    const earliestToDonate = (aDate) => {
        // console.log(setHours(setMinutes(setSeconds(setMilliseconds(add(aDate, {days: 57}), 0), 0), 0), 0));
        return setHours(setMinutes(setSeconds(setMilliseconds(add(aDate, {days: 57}), 0), 0), 0), 0);
    }

    const toggleOpenSchedDonatedRecently = () => {
        setRemindSchedule(false);
        setOpenScheduleDonatedRecently(!openScheduleDonatedRecently);
        setCanConfirm(true);
    }

    const confirmAptRecentDonation = async () => {
        if (!canConfirm) {
            setRemindSchedule(true);
            return
        }
        Promise.all([addRecentDonation(donatedRecentlyDate, user.uid), addUpcomingForRecent(scheduleDonatedRecently, user.uid)])
            .then(console.log("Congrats on confirming your upcoming appointment! (with recent donation)"))
            .then(changeToConfirmedApt())
            .catch(function(err) {
                console.log("Some error occurred :(", err.message)
            })
        // addRecentDonation(donatedRecentlyDate, user.uid); params: recentDate, userId
        // addUpcomingForRecent(scheduleDonatedRecently, user.uid); params: upcomingDate, userId
    }

    const confirmApt = async () => {
        Promise.all([addUpcomingForRecent(scheduledDonationDate, user.uid)])
            .then(console.log("Congrats on confirming your upcoming appointment!"))
            .then(changeToConfirmedApt())
            .catch(function(err) {
                console.log("Some error occurred :(", err.message)
            })
        // addRecentDonation(donatedRecentlyDate, user.uid); params: recentDate, userId
        // addUpcomingForRecent(scheduleDonatedRecently, user.uid); params: upcomingDate, userId
    }

    const changeToConfirmedApt = async () => {
        Promise.allSettled([setConfirmedAptFadeOut(true)])
            .then(setTimeout(() => console.log(".then middle delay"), 1500))
            .then(setTimeout(() => {setConfirmedAptFadeIn(true); console.log(".then last delay")}, 1500))
            .catch(function(err) {
                console.log("Some error occurred :(", err.message)
            })
    }

    const checkAlreadyScheduled = async () => {
        console.log(checkUpcomingDonation(user.uid));
    }
    
    useEffect(() => {
        // console.log("New donatedRecentlyDate ", donatedRecentlyDate);
        setEarliestPossDonation(earliestToDonate(donatedRecentlyDate));
        setScheduleDonatedRecently(earliestToDonate(donatedRecentlyDate));
    }, [donatedRecentlyDate])

    checkAlreadyScheduled();

    return (
        <div className="bg-red-200 h-screen p-4">
            {/* {checkUpcomingDonation(user.uid) !== null ? <div></div> : null} */}
            
            <div className={`${confirmedAptFadeIn ? "animate-fadein" : "hidden"} flex flex-col justify-center items-center gap-4 text-xl`}>
                <div className="text-2xl font-medium">Congratulations!</div>
                <div>Your appointment has been confirmed for {`${cutDownDate(scheduledDonationDate)}`}.</div>
            </div>
            
            <div className={`${confirmedAptFadeOut ? "animate-fadeout" : null}`}>
                <div className="text-xl flex justify-center items-center mb-4">Have you donated blood within the past 56 days?</div>
                <div className="flex justify-center items-center gap-2 mb-4">
                    <button onClick={() => setDonatedRecently(true)} className={`border p-2 min-w-[7%] border-red-600 border-2 rounded-full hover:border-black hover:bg-slate-200 hover:bg-red-600 transition ease-in-out ${donatedRecently === true ? "bg-red-600" : null}`}>Yes</button>
                    <button onClick={() => setDonatedRecently(false)} className={`border p-2 min-w-[7%] border-red-600 border-2 rounded-full hover:border-black hover:bg-slate-200 hover:bg-red-600 transition ease-in-out ${donatedRecently === false ? "bg-red-600" : null}`}>No</button>
                </div>
                {donatedRecently === true && 
                    <div className={`${donatedRecently === true ? "opacity-100" : "opacity-0"} transition ease-in-out duration-500 delay-500 flex flex-col justify-center items-center gap-4`}>
                        <div>Please select the date of your most recent donation</div>
                        <Past56SelectDate
                            dateToPass={donatedRecentlyDate} 
                            functionToPass={setDonatedRecentlyDate}
                        />
                        {(donatedRecently === true && donatedRecentlyDate !== null) &&
                            <div>Since your most recent donation was on {`${cutDownDate(donatedRecentlyDate)}`},
                            <br></br>
                            The earliest your next donation can be is {`${cutDownDate(earliestPossDonation)}`}.</div>
                        }
                        <button onClick={() => toggleOpenSchedDonatedRecently()} className={`border p-2 min-w-[7%] border-red-600 border-2 rounded-full hover:border-black hover:bg-slate-200 hover:bg-red-600 transition ease-in-out ${remindSchedule ? "bg-white animate-pulse" : null}`}>
                            {openScheduleDonatedRecently ? "Close calendar" : "Schedule your next appointment"
                            }
                        </button>
                        {openScheduleDonatedRecently && 
                            <RecentlyDonatedSelectDate
                                earliestPossDonation={earliestPossDonation} 
                                dateToPass={scheduleDonatedRecently} 
                                functionToPass={setScheduleDonatedRecently}
                            />
                        }   
                        {cutDownDate(scheduleDonatedRecently) === cutDownDate(new Date()) ? null : 
                            <div className="flex flex-col justify-center items-center gap-2">
                                <div>Your next donation is scheduled to be {`${cutDownDate(scheduleDonatedRecently)}`}.</div>
                                <button onClick={() => confirmAptRecentDonation()} className="border p-2 min-w-[7%] border-red-600 border-2 rounded-full hover:border-black hover:bg-slate-200 hover:bg-red-600 transition ease-in-out">Confirm</button>
                            </div>
                        }
                    </div>
                }
                {donatedRecently === false &&
                    <div className={`${donatedRecently === false ? "opacity-100" : "opacity-0"} transition ease-in-out duration-500 delay-500 flex flex-col justify-center items-center gap-4`}>
                        <div>Please select the date of your next donation appointment</div>
                        <SelectDate
                            dateToPass={scheduledDonationDate} 
                            functionToPass={setScheduledDonationDate}
                        />
                        <div>Your next donation is scheduled to be {cutDownDate(scheduledDonationDate) === cutDownDate(new Date()) ? "today" : `${cutDownDate(scheduledDonationDate)}`}.</div>
                        <button onClick={() => confirmApt()} className="border p-2 min-w-[7%] border-red-600 border-2 rounded-full hover:border-black hover:bg-slate-200 hover:bg-red-600 transition ease-in-out">Confirm</button>
                    </div>
                }
            </div>
        </div>
    )
  }
  