import React, {Component} from 'react';
import fire from '../fire';
import ListItem from './ListItem'
import './styles/CountSheet.css';

class CountSheet extends Component {

    constructor(props) {
        super(props);
        this.state = {
            product: [],
        };
    }

    componentDidMount() {
        this.readData();
    }
    

    readData() {
        var db = fire.database();

        db.ref('products').once('value').then((snapshot) => {
            let newState = [];

            snapshot.forEach(function(data) {
                //console.log("[COUNTSHEET] products: ", data)
                //console.log("[COUNTSHEET] key: ", data.key);
                newState.push({
                    name: data.val(),
                    key: data.key
                });
            })
           
            this.setState({
                product: newState
            });
        });
   
    }

    
    render() {
        const currentCountID = this.props.countSheetID;
        const countIDs = this.props.countIDs;
        return(
            <div className="sheet">
                <h1>Inventory</h1>
                <div className="header">
                    <h2>Item Name</h2>
                    <div className="labels">
                        <h2>QTY</h2>
                        <h2>ord</h2>
                        <h2>ORD</h2>
                    </div>
                </div>
                {this.state.product.map((data) => {
                    return (
                        <div  key={data.key}>
                            {/*add a react component that takes displays necessary information here 
                            this should be all that's added, meaning a ProductRow component that handles counting too*/}
                            <ListItem name={data.name} id={data.key} currentCountID={currentCountID} countIDs={countIDs}/>  
                        </div>
                    )
                })}
            
            </div>

        );
    }


}

export default CountSheet;