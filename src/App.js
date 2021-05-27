import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyDbCLDD2h5Wbo8QJkrIiqYBJHqvwRMPsiI",
    authDomain: "kchat01-a8122.firebaseapp.com",
    projectId: "kchat01-a8122",
    storageBucket: "kchat01-a8122.appspot.com",
    messagingSenderId: "147687804861",
    appId: "1:147687804861:web:dfa196fc106ed784104cd4",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>KChat0.1</h1>
                <SignOut />
            </header>
            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const SignInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <button className="sign-in" onClick={SignInWithGoogle}>
            Sign in with Google
        </button>
    );
}

function SignOut() {
    return (
        (auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )) ||
        null
    );
}

function ChatRoom() {
    const dummy = useRef();
    const isInitialMount = useRef(true);

    const messageRef = firestore.collection("messages");
    const query = messageRef.orderBy("createdAt").limit(25);

    const [messages] = useCollectionData(query, { idField: "id" });
    let lastuid;

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            dummy.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;

        await messageRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });
        setFormValue("");

        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            lastuid={lastuid}
                        />
                    ))}

                <div ref={dummy}></div>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    autoFocus={true}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button className="submit-btn" type="submit">{`=>`}</button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt={uid} />
            <p>{text}</p>
        </div>
    );
}

export default App;
