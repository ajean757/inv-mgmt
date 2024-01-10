import app from 'firebase'

//initalizes firebase after its import in App.js
const config = {
    apiKey: "AIzaSyBt1taNjgYUbwrEjfai2MtCrQd5h6HGeDw",
    authDomain: "sunset-paradise-b058c.firebaseapp.com",
    databaseURL: "https://sunset-paradise-b058c.firebaseio.com/",
    projectId: "sunset-paradise-b058c",
    storageBucket: "sunset-paradise-b058c.appspot.com",
    messagingSenderId: "483914206873",
    appId: "1:483914206873:web:f76e6231503eb77152f208",
    measurementId: "G-ZX9CMVMYH2"
  };
var fire = app.initializeApp(config);
export default fire;