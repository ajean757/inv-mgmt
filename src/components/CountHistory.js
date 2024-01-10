import React, {Component} from 'react';
import fire from '../fire';
import CountSheet from './CountSheet';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

class CountHistory extends Component {

   deleteCount(countID) {
       var db = fire.database();

       console.log("delete data");
        
       db.ref(countID).set({
           data : null
       })
       db.ref("dates/"+countID).set({
           data: null
       })

       db.ref("userCounts/"+countID).set({
           data: null
       })
       
       //maybe instead of doing this we could force a rerender?
       this.props.readDates();
   }
    render() {
        const countIDs = this.props.countIDs;
        return(
            <Router>
                <div>
                    <h1>Count Dates</h1> 
                    {   
                        countIDs.map((data) => {
                            var date = new Date(data.date);
                            return (
                                <div key={data.countID}>
                                    <Link to={"/CountSheet/" + data.countID}>
                                        {date.toLocaleDateString() + " " + date.toLocaleTimeString()}
                                    </Link>
                                    <button onClick={() =>this.deleteCount(data.countID)}>x</button>
                                </div>
                               
                            )
                        }) 
                    }
                
                    <Switch>
                        {
                            countIDs.map((data) => {
                                return (
                                    //we use component instead of render because otherwise it wont rerender
                                    <Route key={data.countID} path={"/CountSheet/" + data.countID}
                                    component={(props)=> <CountSheet countSheetID={data.countID} countIDs={countIDs}/>}/>
                                )
                            })
                        }
                    </Switch>
                </div>
            </Router>
          
        )
    }
}

export default CountHistory;