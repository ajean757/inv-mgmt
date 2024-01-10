import React, { useState, useEffect } from 'react';
import './App.css';
import fire from './fire.js';
import pushDataToDatabase from './components/DataCompiler.js';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link
} from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from './libs/contextLib';
import Login from './components/Login'
import CountSheet from './components/CountSheet';
import CountHistory from './components/CountHistory';
function App() {


    const [isAuthenticated, userHasAuthenticated] = useState(false);
    const [userID, setUserID] = useState("");
    const [countID, setCountID] = useState("");
    const [countIDs, setCountIDs] = useState([]);

    const PrivateRoute = ({ render: Component, ...args }) => (
        <Route {...args} render={(props) => (
            (isAuthenticated)
                ? <Component {...props} />
                : <Redirect to='/login' />
        )} />
    )

    useEffect(() => {
        console.log("useEffect")

        fire.auth().onAuthStateChanged(function (user) {
            if (user) {
                userHasAuthenticated(true);
                setUserID(user.uid)
            }
            else {
                userHasAuthenticated(false);
            }
        });

        readDates();

    }, [countIDs.length, userID])

    function handleLogout() {
        fire.auth().signOut().then(function () {
            console.log("Sign out successful");
        }).catch(function (error) {
            console.log("Error signing out");
        });
        userHasAuthenticated(false);
    }

    function createNewCount() {
        const weekID = uuidv4();
        //console.log("[APP] uuid: ", weekID)
        var date = new Date();
        //console.log("[APP] date: ", date.valueOf())

        //update the "master" list of counts
        fire.database().ref("dates/").update({
            [weekID]: date.valueOf()
        })
        //update user's count list
        fire.database().ref("userCounts/").update({
            [weekID]: userID
        })
        //update current count ID
        setCountID(weekID);

        //update current count ID list

        let newState = [...countIDs];
        newState.unshift({
            date: date.valueOf(),
            countID: weekID
        });
        setCountIDs(newState);
    }

    async function readDates() {
        var db = fire.database();
        let userCounts = new Map();
        let dates = new Map();

        await db.ref("userCounts").once("value").then((snapshot) => {
            snapshot.forEach((data) => {
                //countID, userID
                userCounts.set(data.key, data.val());
            })

        })

        await db.ref("dates/").orderByValue().once("value").then((snapshot) => {
            snapshot.forEach((data) => {
                //countID, date
                dates.set(data.key, data.val());
            })
        })

        var sortedDates = new Map([...dates.entries()].sort());

        //console.log("usercounts size: " + userCounts.size + " dates size: " + dates.size);

        let newState = [];
      
        
        for (const [countID, id] of userCounts) {
            if (id === userID) {
                newState.push({
                    countID: countID,
                    date: dates.get(countID)
                })
            }
        }

        //sort by most recent date first
        newState.sort(function (a, b) {
            return b.date - a.date;
        });
       
       
        setCountIDs(newState)

    }
    return (
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Router>
                <div className="App">
                    <ul className="topnav">
                        <li><Link className="inventory" to='/CountHistory'>View Previous Count</Link></li>
                        <li onClick={createNewCount}><Link className="inventory" to='/CountSheet'>New Count</Link></li>
                    </ul>
                    <header className="App-header">
                        {isAuthenticated
                            ? <button className="logout" onClick={handleLogout}>Logout</button>
                            : <Login />
                        }
                    </header>

                    <div className="body">
                        {/*
                        <button onClick={() => pushDataToDatabase("./data/starbucks_product.csv")}>Push to DB</button>
                        */}
                        <Switch>
                            {/*<Link className="inventory" to='/CountSheet'>Inventory</Link>*/}
                            <PrivateRoute path='/CountSheet' render={(props) => <CountSheet countSheetID={countID} countIDs={countIDs} />} />
                            <PrivateRoute path='/CountHistory' render={(props) => <CountHistory countIDs={countIDs} readDates={readDates} />} />
                        </Switch>

                    </div>
                </div>
            </Router>
        </AppContext.Provider>
    );
}

export default App;
