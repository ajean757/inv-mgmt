import React, {useState} from 'react';
import './styles/Login.css';
import fire from '../fire';
import firebase from 'firebase/app';


export default function Login() {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function authenticateUser(e) {
        e.preventDefault();
        
        fire.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function() {
            return fire.auth().signInWithEmailAndPassword(email, password);
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
        //sign in user and handle errors
        fire.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') 
                alert('Wrong password.');
            else 
                alert(errorMessage);
        });

        //reset form
        setEmail("");
        setPassword("");
    }

    return (
        <div className = "Login">
            <h1>Please Login to Continue</h1>
            <form className="authForm" onSubmit={authenticateUser}>
                <input
                    type = "email"
                    name = "email"
                    placeholder = "email"
                    onChange={e => setEmail(e.target.value)}
                    value={email}
                />
                <br/>
                <input 
                    type = "password"
                    name = "password"
                    placeholder = "password"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                />
                <br/>
                <button className="button" type="submit" >Login</button>
            </form>
        </div>
    );
    
}