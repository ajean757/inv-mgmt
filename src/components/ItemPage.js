import React, { Component } from 'react';
import fire from '../fire';
import './styles/ItemPage.css';

class ItemPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rem: 0,
            cases: 0
        }
        this.handleInvChange = this.handleInvChange.bind(this);
        this.handleCurrChange = this.handleCurrChange.bind(this);
        this.handleCurrCasesChange = this.handleCurrCasesChange.bind(this);
        this.handleOrdChange = this.handleOrdChange.bind(this);
        this.submitCount = this.submitCount.bind(this);
        this.closeComponent = this.closeComponent.bind(this);
        this.sanitizeInput = this.sanitizeInput.bind(this);
    }

    closeComponent() {
        this.props.unmountMe();
    }

    submitCount(e) {
        e.preventDefault();
        var db = fire.database();

        const inc = this.sanitizeInput(this.props.in);
        const cur = this.sanitizeInput(this.props.current);
        const ord = this.sanitizeInput(this.props.ord);

        const weekRef = this.props.countID;
        const id = this.props.id;

    
        db.ref(weekRef + "/" + id).once("value").then((snapshot) => {
            //console.log("[ITEMPAGE] update ref: " +  snapshot.ref); 
            snapshot.ref.update({
                incoming: inc,
                onhand: cur,
                ord: ord
            })
        })

        this.closeComponent();

    }

    async recalculateOrder() {
        await this.didModify("ord", false).then(
            () => this.props.handleOrder()
        );
    }

    async resetIncoming() {
        await this.didModify("in", false).then(
            () => {
                this.props.databaseUpdate();
            }
        )
    }

    async didModify(property, value) {
        const weekRef = this.props.countID;
        const id = this.props.id;
        const propModified = property + "Modified";

        await fire.database().ref(weekRef + "/" + id).once("value").then((snapshot) => {
            //console.log("[ITEMPAGE] update ref: " +  snapshot.ref); 

            snapshot.ref.update({
                [propModified]: value
            })
        })

        return propModified;
    }

    sanitizeInput(num) {
        const parsed = parseInt(num);
        if (isNaN(parsed))
            return 0;

        return parsed;
    }

    handleInvChange(e) {
        const inc = this.sanitizeInput(e.target.value);
        if (inc === this.props.in) {
            this.didModify("in", false);
        }
        else {
            this.didModify("in", true)
            this.props.onInvChange(inc);
        }
    }

    //increments/decrements count by 1 each
    handleCurrChange(e) {
        const current = this.props.current;
        const rem = this.sanitizeInput(current % this.props.itemqty);

        const diff = this.sanitizeInput(e.target.value) - rem;
        //sum of current + remainder
        let val = current + diff;

        this.props.onCurrChange(val);
    }

    //increments/decrements count by 1 case
    handleCurrCasesChange(e) {

        const itemqty = this.props.itemqty;
        const cases = this.sanitizeInput(e.target.value);
        const rem = this.sanitizeInput(this.props.current % itemqty);

        //sum of remainder + cases
        let val = rem + (itemqty * cases);
        this.props.onCurrCaseChange(val);
    }

    handleOrdChange(e) {
        const ord = this.sanitizeInput(e.target.value);
        if (ord === this.props.ord) {
            this.didModify("ord", false);
        }
        else {
            this.didModify("ord", true)
            this.props.onOrdChange(ord);
        }

    }

    render() {

        const name = this.props.itemname;
        const inc = this.props.in;
        const current = this.props.current;
        const ord = this.props.ord;
        const itemqty = this.props.itemqty;

        const cases = this.sanitizeInput(Math.floor(current / itemqty));
        const rem = this.sanitizeInput(current % itemqty);
        //console.log("casees 2: ", rem)

        return (

            <div>
                <h1>{name}</h1>
                <form onSubmit={this.submitCount}>
                    <div className="formpage">
                        <div className="onhand">
                            <p>Onhand</p>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                onChange={this.handleCurrChange}
                                value={rem} />
                            <p>eaches</p>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                onChange={this.handleCurrCasesChange}
                                value={cases} />
                            <p>cases</p>
                        </div>
                        <div className="incoming">
                            <p>Incoming</p>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                onChange={this.handleInvChange}
                                value={inc} />
                        </div>
                        <div className="order">
                            <p>Order</p>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                onChange={this.handleOrdChange}
                                value={ord} />
                        </div>
                    </div>
                    <br />
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => this.resetIncoming()}>Reset Incoming</button>
                    <button type="button" onClick={() => this.recalculateOrder()}>Recalculate Order</button>
                </form>
            </div>
        )
    }
}

export default ItemPage;