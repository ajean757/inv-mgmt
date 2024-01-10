import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
  } from "react-router-dom";
import fire from '../fire';
import ItemPage from './ItemPage';
import './styles/ListItem.css';
import quantityToOrder from './OrderingAlgorithm';

class ListItem extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            in: 0,
            current: 0,
            ord: 0,
            itemqty: 0,
            renderChild: false,
        }
        this.handleCurrChange = this.handleCurrChange.bind(this);
        this.handleCurrCasesChange = this.handleCurrCasesChange.bind(this);
        this.handleInvChange = this.handleInvChange.bind(this);
        this.handleOrdChange = this.handleOrdChange.bind(this);
        this.updateFromDatabase = this.updateFromDatabase.bind(this);
        this.handleChildRender = this.handleChildRender.bind(this);
        this.getOrderQty = this.getOrderQty.bind(this);
    } 

    handleChildRender() {
        if (!this.state.renderChild) {
            this.setState({
                renderChild: true
            })
        }
        else {
            this.setState({
                renderChild: false
            })
        }
    }

    componentDidMount() {
        this.getOrderQty()
        this.updateFromDatabase()
        
    }

    sanitizeInput(num) {
        const parsed = parseInt(num);
        if(isNaN(parsed))
            return 0;

        return parsed;
    }
    
    async updateFromDatabase() {
        const id = this.props.id;
        const weekRef = this.props.currentCountID;
        const countIDs = this.props.countIDs;

        var prevCountID;
        //locate previous count ID based on current
        for(let i = 0; i < countIDs.length; i++) {
            //if the current count is the last in the list
            if (i === countIDs.length-1) {
                return 0;
            }
            if(weekRef === countIDs[i].countID) {
                prevCountID = countIDs[i+1].countID;
                break;
            }
        }

        await Promise.all([
            this.getValFromDB(weekRef, id, "onhand"),
            this.getValFromDB(weekRef, id, "ord"),
            this.getValFromDB("quantities", id, ""),
        ]).then((values) => {
            this.setState({
                current: this.sanitizeInput(values[0]),
                ord: this.sanitizeInput(values[1]),
                itemqty: this.sanitizeInput(values[2])
            })
        });

        const inModified = await this.getValFromDB(weekRef, id, "inModified");

        //if it's not modified, get value from last week
        if (!inModified) {
            this.getValFromDB(prevCountID, id, "ord").then((val) => {
                this.setState({
                    in: val
                })
            })
        }
        //if user did modify, retain current value
        else {
            this.getValFromDB(weekRef, id, "incoming").then((val) => {
                this.setState({
                    in: val
                })
            })
        }
        
       


    }
    /* WIP Function
     * highlight edited values such as in and ord
     * doesn't seem to be able to update values, they return 0 
     * 
     */
    async highlightEdited() {
        const weekRef = this.props.currentCountID;
        const id = this.props.itemID;
        await Promise.all([
            this.getValFromDB(weekRef, id, "inModified"),
            this.getValFromDB(weekRef, id, "ordModified")
        ]).then((values) => {
            console.log("dfsdfsdfsdfsdf", values[1])
            if(values[0]) {
                document.getElementById("in").style.color = "green"
            }
        });

    }
    async getValFromDB(weekRef, itemID, val) {
        return fire.database().ref(weekRef + "/" + itemID + "/" + val).once("value").then((snapshot) => {
            if (snapshot.val()) {    
                return snapshot.val();
            }
            else {
                return 0;
            }
        })
    }

    async getOrderQty() {
        const countIDs = this.props.countIDs;
        const currentCountID = this.props.currentCountID;
        const id = this.props.id;

        //if user changed the value, don't recaclulate
        const wasModified = await this.getValFromDB(currentCountID, id, "ordModified");
        if (wasModified) {
            console.log("YAY DIDN'T CHANGE ORDER")
            return;
        }

        var ordQty = await quantityToOrder(id, currentCountID, countIDs).then((val) => {
           return val;
        });
        //console.log("[LISTITEM] ordQty: ", ordQty);

        fire.database().ref(currentCountID + "/" + id).once("value").then((snapshot) => {
            //console.log("[ITEMPAGE] update ref: " +  snapshot.ref); 
            try {
                snapshot.ref.update({
                    ord: ordQty
                })
            }
            catch(err) {
                console.log(err);
            }
        })

        this.setState({
            ord: ordQty
        })

    }

    handleInvChange(value) {
        this.setState({in: value})
    }
    handleCurrChange(value) {
        this.setState({current: value})
    }
    handleCurrCasesChange(value) {
        this.setState({current: value  })
    }
    handleOrdChange(value) {
        this.setState({ord: value})
    }
    render() {
        return(
            <Router>
                <div className="productRow">
                    <div className="data">
                        <div onClick={this.handleChildRender}>
                            <Link to='/ItemPage'>{this.props.name}</Link>
                        </div>
                    
                        <div className="countInput"> 
                            <div className="output" id="current">{this.state.current}</div> 
                            <div className="output" id="in">{this.state.in}</div>
                            <div className="output" id="ord">{this.state.ord}</div>
                        </div>
                    </div>                                     
                </div>
                <div  id="itempage">
                        {this.state.renderChild ? 
                            <Route 
                                path='/ItemPage' 
                                render={(props) => 
                                    <ItemPage
                                        itemname={this.props.name}
                                        id={this.props.id}
                                        countID={this.props.currentCountID}
                                        in={this.state.in}
                                        current={this.state.current}
                                        ord={this.state.ord}
                                        itemqty={this.state.itemqty}
                                        onInvChange={this.handleInvChange}
                                        onCurrChange={this.handleCurrChange}
                                        onCurrCaseChange={this.handleCurrCasesChange}
                                        onOrdChange={this.handleOrdChange}
                                        handleOrder={this.getOrderQty}
                                        databaseUpdate={this.updateFromDatabase}
                                        unmountMe={this.handleChildRender} 
                                    />
                                }
                            />
                        : null}
                    </div>
            </Router>
        );
    }
}

export default ListItem;