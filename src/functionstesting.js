
const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");
var db = firebase.firestore();

var docRef = db.collection("refreshers").doc("mdr_base");

//print it

function printData(docRef) {
  docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
}

printData(docRef)
db.collection("refreshers").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
      console.log(`${doc.id}`, doc.data().name);
  });
});



//print it



  docRef.get().then(function(doc) {
      if (doc.exists) {
        setText(doc.data().name);
        console.log("Document data:", doc.data());
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
      
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
  
  console.log("Did it work? ", tempData)

  db.collection("refreshers").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id}`, doc.data().name);
    });
  });
