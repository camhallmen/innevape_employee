// Logout
const logout = document.querySelector("#logout")

logout.addEventListener("click", (e) => {
    e.preventDefault()
    auth.signOut().then(() => {
        // console.log("User signed out")
        location.reload();
    })
})

// Login
const loginForm = document.querySelector("#login-form")

loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get user info
    const email = loginForm["login-email"].value
    const password = loginForm["login-password"].value

    // Two factor auth
    db.collection("users").where("email", "==", email).get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            var info = doc.data()
            console.log("###### " + email)
        })
    })

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user)
        loginForm.reset()
    })
})