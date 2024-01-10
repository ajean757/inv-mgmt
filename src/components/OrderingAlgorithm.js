import fire from '../fire';
//const countIDs = [];

async function quantityToOrder(itemID, currentCountID, countIDs) {
   
    //console.log("[ORDERINGALGORITHM] length: ", countIDs.length);
  
    if(countIDs.length <= 1) {
        //fix later to accomodate for PAR 
        return 0;
    }


    fire.database().ref(currentCountID + "/" + itemID).once("value").then((snapshot) => {
        //console.log("[ITEMPAGE] update ref: " +  snapshot.ref); 
        snapshot.ref.update({
            ordModified : false
        })
    })
    
    var prevCountID;
    //get the previous count ID
    for(let i = 0; i < countIDs.length-1; i++) {
        //if the current count is the last in the list
       //ERROR OCCURS HERE WHEN FINDING LAST COUNT
        if(currentCountID === countIDs[i].countID) {
            
            prevCountID = countIDs[i+1].countID;
            console.log("prevCountID: ", prevCountID);
            break;
        }
    }
    
    if(!(prevCountID)) {
        return 0;
    }
    const productQty = await getValFromDB("quantities", itemID, "");

    const qtySold = await Promise.all([
        getValFromDB(prevCountID, itemID, "onhand"),
        getValFromDB(prevCountID, itemID, "incoming"),
        getValFromDB(currentCountID, itemID, "onhand"),
    ]).then((values) => {
        return values[0] + (productQty*values[1]) - values[2];
    });

    const currOnHand = await getValFromDB(currentCountID, itemID, "onhand");

    const par = Math.round(qtySold * 1.2);
    //console.log(par);

    if((currOnHand - par) >= qtySold) {
        return 0;
    }

    var cases = Math.floor(par / productQty);

    if (par % productQty >= 3) {
        cases++;
    }


    //console.log("productqty: ", productQty)

    console.log("[ORDERINGALGORITHM] qtySold: ", cases);

    return cases;
    
}
/*
function getcountIDs() {

    fire.database().ref("dates").orderByValue().once("value").then((snapshot) => {
        snapshot.forEach(function(data) {
            countIDs.push({
                date: data.val(),
                countID: data.key
            });
        });
    })
    console.log("[ORDERINGALGORITHM] countDate (out): ", countIDs.length)
}*/

async function getValFromDB(ref, itemID, val) {
    //console.log(ref + "/" + itemID + "/" + val)
    return fire.database().ref(ref + "/" + itemID + "/" + val).once("value").then((snapshot) => {
        if (snapshot.val()) {
            //console.log("[ORDERINGALGORITHM] val: ", snapshot.val());

            return snapshot.val();
        }
        else {
            //console.log("ERR")
            return 0;

        }
    })
}


export default quantityToOrder;