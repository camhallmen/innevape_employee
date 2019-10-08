// Global constants for holding user data
const userName = document.querySelector("#name")
const status = document.querySelector("#status")
const startDate = document.querySelector("#start-date")
const nextEval = document.querySelector("#next-eval")
const salary = document.querySelector("#salary")
const vacationTime = document.querySelector("#vacation-time")
const jobTitle = document.querySelector("#job-title")

// Show or hide Pay Rate
$("#paybtn").on("click", function() {
    var display = $("#payrate")[0].style.cssText
    if (display === "display: none;") {
        $("#payrate").show()
    } else {
        $("#payrate").hide()
    }
})

// Captcha verify
function recaptchaCallback() {
    var submitBtn = document.querySelector("#submit-btn")
    submitBtn.removeAttribute("disabled")
    submitBtn.style.cursor = "pointer"
}

// Resize for mobile
// $(window).resize(function () {
//     var viewportWidth = $(window).width();
//     if (viewportWidth < 480) {
//             $(".col-sm-8").removeClass("col-sm-8")
//     }
// });

// Signup new user

$("#submit-new-user").on("click", (e) => {
    e.preventDefault()
    var newName = $("#new-user-fullname").val()
    var newEmail = $("#new-user-login-email").val()
    var newPass = $("#new-user-login-password").val()

    // Create the user
    auth.createUserWithEmailAndPassword(newEmail, newPass).then(cred => {
        $("#display-after-creation").css("display", "block")
    })

    // Add name to users collection
    db.collection("users").doc(newEmail).set({
        name: newName
    })
})

// Retrive and display user info after login
auth.onAuthStateChanged(user => {
    if (user) {
        modal.style.display = "none";
        // Show homepage link
        $("#login-redirect").css("display", "block")
        // Displays username on header
        $("#greeting").html("Hello " + user.email + "!")

        // Query firebase for user info
        var docRef = db.collection("users").doc(user.email);

        docRef.get().then(function(doc) {
            if (doc.exists) {
            const info = doc.data()

            // Write data to html
            userName.append(info.name)
            status.append(info.status)
            startDate.append(info.startDate)
            nextEval.append(info.nextEval)
            salary.append(info.salary)
            vacationTime.append(info.vacationTime)
            jobTitle.append(info.title)

    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    } else {
        console.log("User logged out")
        $("#greeting").html("Please Login!")
    }
})

// Read and display updates

// Show all updates on news page
db.collection("updates").orderBy("created_at", "desc").get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        renderUpdates(doc)
    })
})

const updateContainer = $("#updates-go-here")

function renderUpdates(doc) {
    let message = document.createElement("p")
    let div = document.createElement("div")
    message.setAttribute("message-id", doc.id)
    message.textContent = doc.data().message
    div.appendChild(message)
    div.classList.add("home-card")
    updateContainer.append(div)
}

// Show two most recent updates on home page
db.collection("updates").orderBy("created_at", "desc").limit(2).get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        renderHome(doc)
    })
})

const homeUpdate = $("#home-update")

function renderHome(doc) {
    let message = document.createElement("p")
    let div = document.createElement("div")
    message.setAttribute("message-id", doc.id)
    message.textContent = doc.data().message
    div.appendChild(message)
    div.classList.add("home-card")
    homeUpdate.append(div)
}

// Show add update link and search link if user is admin
auth.onAuthStateChanged(user => {
    if (user.email === "camhallmen@gmail.com") {
        $("#go-to-updates").css("display", "block")
        $("#go-to-search").css("display", "block")
    }
})

// Add new update
const myMessage = $("#my-message")
const submitMessage = $("#submit-message")

submitMessage.on("click", (e) => {
    e.preventDefault()
    console.log(myMessage.val())
    db.collection("updates").add({
        message: myMessage.val(),
        created_at: firebase.firestore.Timestamp.fromDate(new Date())
    })
    myMessage.val("")
    alert("Message uploaded successfully!")
})

// All update functions for admin
auth.onAuthStateChanged(user => {
    if (user.email === "camhallmen@gmail.com") {
        // All functions once verified

        // Show all dates absent
        var showDateTracking = function(doc) {
            userQuery = $("#search-value").val()
            db.collection("users").where("name", "==", userQuery).get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    var dates = doc.data().date
                    var ol = document.createElement("ol")
                    document.getElementById("put-date-here").appendChild(ol)
                    dates.forEach(function(date) {
                        var li = document.createElement("li")
                        ol.appendChild(li)
                        li.innerHTML += date
                    })
                })
            })
        }

        // Show all reasons for being absent
        var showReasonTracking = function(doc) {
            userQuery = $("#search-value").val()
            db.collection("users").where("name", "==", userQuery).get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    var reasons = doc.data().reason
                    var ol = document.createElement("ol")
                    document.getElementById("put-reason-here").appendChild(ol)
                    reasons.forEach(function(reason) {
                        var li = document.createElement("li")
                        ol.appendChild(li)
                        li.innerHTML += reason
                    })
                })
            })
        }

        // Show name list function
        const nameList = $("#name-list")
        var showNameList = function(doc) {
            var li = document.createElement("li")
            var name = document.createElement("span")
            console.log(doc.data().name)
            name.textContent = doc.data().name
            li.append(name)
            nameList.append(li)
        }

        // Call namelist function with data
        $("#show-all-names").on("click", function() {
            $("#name-reference").css("display", "block")
            db.collection("users").get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    showNameList(doc)
                })
            })
        })

        // Hide namelist
        $("#hide-name-reference").on("click", function() {
            $("#name-reference").css("display", "none")
        })

        // Show and display search results
        $("#submit-search").on("click", (e) => {
            e.preventDefault()
            userQuery = $("#search-value").val()
            db.collection("users").where("name", "==", userQuery).get().then((snapshot) => {
                $("#display-admin-search").css("display", "block")
                snapshot.docs.forEach(doc => {
                    showDateTracking(doc)
                    showReasonTracking(doc)
                    var adminUpdate = function() {
                    console.log(doc.data())
                    var info = doc.data()
                    // Empty data if any
                    $("#search-name").empty()
                    $("#search-status").empty()
                    $("#search-start-date").empty()
                    $("#search-next-eval").empty()
                    $("#search-salary").empty()
                    $("#search-vacation-time").empty()
                    $("#search-job-title").empty()
                    $("#search-phone").empty()
                    $("#search-email").empty()
                    $("#search-emergency").empty()
                    $("#search-health").empty()
                    $("#search-health-date").empty()
                    $("#search-health-eligible").empty()
                    $("#search-street").empty()
                    $("#search-city").empty()
                    $("#search-zip").empty()
                    $("#search-health-provider").empty()
                    $("#search-provider-notes").empty()
                    $("#search-aflac-yes").empty()
                    $("#search-aflac-no").empty()
                    $("#search-lasteval-date").empty()
                    $("#search-lasteval-score").empty()
                    $("#search-90day").empty()
                    $("#search-6month").empty()
                    $("#search-90day-review").empty()
                    $("#search-term").empty()
                    $("#search-eval-notes").empty()
                    $("#search-results-notes").empty()
                    $("#search-first-coaching-date").empty()
                    $("#search-first-coaching-reason").empty()
                    $("#search-second-coaching-date").empty()
                    $("#search-second-coaching-reason").empty()
                    $("#search-third-coaching-date").empty()
                    $("#search-third-coaching-reason").empty()
                    $("#search-disc-term-date").empty()
                    $("#search-disc-term-reason").empty()
                    $("#search-vacation-eligible-date").empty()
                    $("#search-available-vacation").empty()
                    $("#search-vacation-used").empty()
                    $("#search-vacation-renewal").empty()
                    $("#put-date-here").empty()
                    $("#put-reason-here").empty()
                    $("#search-has-read").empty()
                    $(".edit-form").css("display", "none")

                    // Empty input fields
                    $("#update-name").val("")
                    $("#update-status").val("")
                    $("#update-start-date").val("")
                    $("#update-next-eval").val("")
                    $("#update-salary").val("")
                    $("#update-vacation-time").val("")
                    $("#update-title").val("")
                    $("#update-phone").val("")
                    $("#update-email").val("")
                    $("#update-emergency").val("")
                    $("#update-health").val("")
                    $("#update-health-date").val("")
                    $("#update-health-eligible").val("")
                    $("#update-street").val("")
                    $("#update-city").val("")
                    $("#update-zip").val("")
                    $("#update-health-provider").val("")
                    $("#update-provider-notes").val("")
                    $("#update-aflac-yes").val("")
                    $("#update-aflac-no").val("")
                    $("#update-lasteval-date").val("")
                    $("#update-lasteval-score").val("")
                    $("#update-90day").val("")
                    $("#update-6month").val("")
                    $("#update-90day-review").val("")
                    $("#update-term").val("")
                    $("#update-eval-notes").val("")
                    $("#update-results-notes").val("")
                    $("#update-first-coaching-date").val("")
                    $("#update-first-coaching-reason").val("")
                    $("#update-second-coaching-date").val("")
                    $("#update-second-coaching-reason").val("")
                    $("#update-third-coaching-date").val("")
                    $("#update-third-coaching-reason").val("")
                    $("#update-disc-term-date").val("")
                    $("#update-disc-term-reason").val("")
                    $("#update-vacation-eligible-date").val("")
                    $("#update-available-vacation").val("")
                    $("#update-vacation-used").val("")
                    $("#update-vacation-renewal").val("")
                    $("#update-absence-date").val("")
                    $("#update-absence-date").val("")
                    $("#update-has-read").val("")

                    // Display results
                    $("#search-name").append(info.name)
                    document.querySelector("#search-name").setAttribute("data-id", doc.id)
                    console.log(doc.id)
                    $("#search-status").append(info.status)
                    $("#search-start-date").append(info.startDate)
                    $("#search-next-eval").append(info.nextEval)
                    $("#search-salary").append(info.salary)
                    $("#search-vacation-time").append(info.vacationTime)
                    $("#search-job-title").append(info.title)
                    $("#search-phone").append(info.phone)
                    $("#search-email").append(info.email)
                    $("#search-emergency").append(info.emergency)
                    $("#search-health").append(info.eligibleForHealth)
                    $("#search-health-date").append(info.healthAccepted)
                    $("#search-health-eligible").append(info.healthEligible)
                    $("#search-street").append(info.street)
                    $("#search-city").append(info.city)
                    $("#search-zip").append(info.zip)
                    $("#search-health-provider").append(info.healthProvider)
                    $("#search-provider-notes").append(info.providerNotes)
                    $("#search-aflac-yes").append(info.aflacYes)
                    $("#search-aflac-no").append(info.aflacNo)
                    $("#search-lasteval-date").append(info.lastEvalDate)
                    $("#search-lasteval-score").append(info.lastEvalScore)
                    $("#search-90day").append(info.nintyDay)
                    $("#search-6month").append(info.sixMonth)
                    $("#search-90day-review").append(info.nintyDayReview)
                    $("#search-term").append(info.term)
                    $("#search-eval-notes").append(info.evalNotes)
                    $("#search-results-notes").append(info.resultsNotes)
                    $("#search-first-coaching-date").append(info.firstCoachingDate)
                    $("#search-first-coaching-reason").append(info.firstCoachingReason)
                    $("#search-second-coaching-date").append(info.secondCoachingDate)
                    $("#search-second-coaching-reason").append(info.secondCoachingReason)
                    $("#search-third-coaching-date").append(info.thirdCoachingDate)
                    $("#search-third-coaching-reason").append(info.thirdCoachingReason)
                    $("#search-disc-term-date").append(info.discTermDate)
                    $("#search-disc-term-reason").append(info.discTermReason)
                    $("#search-vacation-eligible-date").append(info.vacationEligibleDate)
                    $("#search-available-vacation").append(info.availableVacation)
                    $("#search-vacation-used").append(info.vacationUsed)
                    $("#search-vacation-renewal").append(info.vacationRenewal)
                    $("#search-has-read").append(info.has_read, info.submitted_at)
                    }
                    adminUpdate()

                // Update name
                $("#push-name").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-name").val()
                    db.collection("users").doc(dataID).update({
                        name: newData
                    })
                    $("#search-name").html(newData)
                })

                // Update status
                $("#push-status").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-status").val()
                    db.collection("users").doc(dataID).update({
                        status: newData
                    })
                    $("#search-status").html(newData)
                })

                // Update start date
                $("#push-start-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-start-date").val()
                    db.collection("users").doc(dataID).update({
                        startDate: newData
                    })
                    $("#search-start-date").html(newData)
                })

                // Update next evaluation
                $("#push-next-eval").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-next-eval").val()
                    db.collection("users").doc(dataID).update({
                        nextEval: newData
                    })
                    $("#search-next-eval").html(newData)
                })

                // Update salary
                $("#push-salary").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-salary").val()
                    db.collection("users").doc(dataID).update({
                        salary: newData
                    })
                    $("#search-salary").html(newData)
                })

                // Update vacation time
                $("#push-vacation-time").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-vacation-time").val()
                    db.collection("users").doc(dataID).update({
                        vacationTime: newData
                    })
                    $("#search-vacation-time").html(newData)
                })

                // Update title
                $("#push-title").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-title").val()
                    db.collection("users").doc(dataID).update({
                        title: newData
                    })
                    $("#search-job-title").html(newData)
                })

                // Update phone
                $("#push-phone").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-phone").val()
                    db.collection("users").doc(dataID).update({
                        phone: newData
                    })
                    $("#search-phone").html(newData)
                })

                // Update email
                $("#push-email").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-email").val()
                    db.collection("users").doc(dataID).update({
                        email: newData
                    })
                    $("#search-email").html(newData)
                })

                // Update emergency contact
                $("#push-emergency").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-emergency").val()
                    db.collection("users").doc(dataID).update({
                        emergency: newData
                    })
                    $("#search-emergency").html(newData)
                })

                // Update health insurance
                $("#push-health").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-health").val()
                    db.collection("users").doc(dataID).update({
                        eligibleForHealth: newData
                    })
                    $("#search-health").html(newData)
                })

                // Update health accepted date
                $("#push-health-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-health-date").val()
                    db.collection("users").doc(dataID).update({
                        healthAccepted: newData
                    })
                    $("#search-health-date").html(newData)
                })

                // Update insurance eligibility date
                $("#push-health-eligible").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-health-eligible").val()
                    db.collection("users").doc(dataID).update({
                        healthEligible: newData
                    })
                    $("#search-health-eligible").html(newData)
                })

                // Update street
                $("#push-street").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-street").val()
                    db.collection("users").doc(dataID).update({
                        street: newData
                    })
                    $("#search-street").html(newData)
                })

                // Update city/state
                $("#push-city").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-city").val()
                    db.collection("users").doc(dataID).update({
                        city: newData
                    })
                    $("#search-city").html(newData)
                })

                // Update zip
                $("#push-zip").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-zip").val()
                    db.collection("users").doc(dataID).update({
                        zip: newData
                    })
                    $("#search-zip").html(newData)
                })

                // Update health provider
                $("#push-health-provider").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-health-provider").val()
                    db.collection("users").doc(dataID).update({
                        healthProvider: newData
                    })
                    $("#search-health-provider").html(newData)
                })

                // Update provider notes
                $("#push-provider-notes").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-provider-notes").val()
                    db.collection("users").doc(dataID).update({
                        providerNotes: newData
                    })
                    $("#search-provider-notes").html(newData)
                })

                // Update AFLAC if accepted
                $("#push-aflac-yes").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-aflac-yes").val()
                    db.collection("users").doc(dataID).update({
                        aflacYes: newData
                    })
                    $("#search-aflac-yes").html(newData)
                })

                // Update AFLAC if not elligible
                $("#push-aflac-no").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-aflac-no").val()
                    db.collection("users").doc(dataID).update({
                        aflacNo: newData
                    })
                    $("#search-aflac-no").html(newData)
                })

                // Update last evaluation date
                $("#push-lasteval-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-lasteval-date").val()
                    db.collection("users").doc(dataID).update({
                        lastEvalDate: newData
                    })
                    $("#search-lasteval-date").html(newData)
                })

                // Update last evaluation score
                $("#push-lasteval-score").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-lasteval-score").val()
                    db.collection("users").doc(dataID).update({
                        lastEvalScore: newData
                    })
                    $("#search-lasteval-score").html(newData)
                })

                // Update 90 day eval
                $("#push-90day").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-90day").val()
                    db.collection("users").doc(dataID).update({
                        nintyDay: newData
                    })
                    $("#search-90day").html(newData)
                })

                // Update 6 month eval
                $("#push-6month").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-6month").val()
                    db.collection("users").doc(dataID).update({
                        sixMonth: newData
                    })
                    $("#search-6month").html(newData)
                })

                // Update 90 day review
                $("#push-90day-review").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-90day-review").val()
                    db.collection("users").doc(dataID).update({
                        nintyDayReview: newData
                    })
                    $("#search-90day-review").html(newData)
                })

                // Update termination date
                $("#push-term").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-term").val()
                    db.collection("users").doc(dataID).update({
                        term: newData
                    })
                    $("#search-term").html(newData)
                })

                // Update eval notes
                $("#push-eval-notes").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-eval-notes").val()
                    db.collection("users").doc(dataID).update({
                        evalNotes: newData
                    })
                    $("#search-eval-notes").html(newData)
                })

                // Update results notes
                $("#push-results-notes").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-results-notes").val()
                    db.collection("users").doc(dataID).update({
                        resultsNotes: newData
                    })
                    $("#search-results-notes").html(newData)
                })

                // Update 1st coaching date
                $("#push-first-coaching-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-first-coaching-date").val()
                    db.collection("users").doc(dataID).update({
                        firstCoachingDate: newData
                    })
                    $("#search-first-coaching-date").html(newData)
                })

                // Update 1st coaching reason
                $("#push-first-coaching-reason").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-first-coaching-reason").val()
                    db.collection("users").doc(dataID).update({
                        firstCoachingReason: newData
                    })
                    $("#search-first-coaching-reason").html(newData)
                })

                // Update 2nd coaching date
                $("#push-second-coaching-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-second-coaching-date").val()
                    db.collection("users").doc(dataID).update({
                        secondCoachingDate: newData
                    })
                    $("#search-second-coaching-date").html(newData)
                })

                // Update 2nd coaching reason
                $("#push-second-coaching-reason").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-second-coaching-reason").val()
                    db.collection("users").doc(dataID).update({
                        secondCoachingReason: newData
                    })
                    $("#search-second-coaching-reason").html(newData)
                })

                // Update 3rd coaching date
                $("#push-third-coaching-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-third-coaching-date").val()
                    db.collection("users").doc(dataID).update({
                        thirdCoachingDate: newData
                    })
                    $("#search-third-coaching-date").html(newData)
                })

                // Update 3rd coaching reason
                $("#push-third-coaching-reason").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-third-coaching-reason").val()
                    db.collection("users").doc(dataID).update({
                        thirdCoachingReason: newData
                    })
                    $("#search-third-coaching-reason").html(newData)
                })

                // Update disciplinary termination date
                $("#push-disc-term-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-disc-term-date").val()
                    db.collection("users").doc(dataID).update({
                        discTermDate: newData
                    })
                    $("#search-disc-term-date").html(newData)
                })

                // Update disciplinary termination reason
                $("#push-disc-term-reason").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-disc-term-reason").val()
                    db.collection("users").doc(dataID).update({
                        discTermReason: newData
                    })
                    $("#search-disc-term-reason").html(newData)
                })

                // Update vacation eligible date
                $("#push-vacation-eligible-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-vacation-eligible-date").val()
                    db.collection("users").doc(dataID).update({
                        vacationEligibleDate: newData
                    })
                    $("#search-vacation-eligible-date").html(newData)
                })

                // Update available vacation time
                $("#push-available-vacation").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-available-vacation").val()
                    db.collection("users").doc(dataID).update({
                        availableVacation: newData
                    })
                    $("#search-available-vacation").html(newData)
                })

                // Update vacation used YTD
                $("#push-vacation-used").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-vacation-used").val()
                    db.collection("users").doc(dataID).update({
                        vacationUsed: newData
                    })
                    $("#search-vacation-used").html(newData)
                })

                // Update vacation renewal date
                $("#push-vacation-renewal").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-vacation-renewal").val()
                    db.collection("users").doc(dataID).update({
                        vacationRenewal: newData
                    })
                    $("#search-vacation-renewal").html(newData)
                })

                // Update has read policies
                $("#push-has-read").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-has-read").val()
                    db.collection("users").doc(dataID).update({
                        has_read: newData
                    })
                    $("#search-has-read").html(newData)
                })

                // Update absence date
                $("#push-absence-date").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-absence-date").val()
                    db.collection("users").doc(dataID).update({
                        date: firebase.firestore.FieldValue.arrayUnion(newData)
                    })
                    $("#put-date-here").empty()
                    $("#update-absence-date").val("")
                    showDateTracking(doc)
                })

                // Update absence reason
                $("#push-absence-reason").on("click", (e) => {
                    e.preventDefault()
                    var dataID = document.querySelector("#search-name").getAttribute("data-id")
                    var newData = $("#update-absence-reason").val()
                    db.collection("users").doc(dataID).update({
                        reason: firebase.firestore.FieldValue.arrayUnion(newData)
                    })
                    $("#put-reason-here").empty()
                    $("#update-absence-reason").val("")
                    showReasonTracking(doc)
                })
                })

                // Show edit button and forms
                $(".admin-edit-btn").css("display", "inline-block")
                $(".admin-edit-btn").on("click", (e) => {
                    e.preventDefault()
                    $(".edit-form").css("display", "block")
                })
            })
        })
    }
})

// Record if user has checked policy box

auth.onAuthStateChanged(user => {
    if (user) {
        $("#check-btn").on("click", function() {
            var checkTheCheckbox = document.getElementById("has-read-box").checked
            if (checkTheCheckbox === true) {
                alert("Thank you for reading all Innevape Policies!")
                db.collection("users").doc(user.email).update({
                    has_read: user.email + " has read all Innevape Policies",
                    submitted_at: firebase.firestore.Timestamp.fromDate(new Date())
                })
            } else {
                alert("Please mark the checkbox!")
            }
        })
    }
})

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn")
var mobileBtn = document.getElementById("mobile-btn")

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

mobileBtn.onclick = function() {
    modal.style.display = "block";
  }

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Check if policies have been read
var hasRead = ["data"]

$(document).ready(function() {
    if (localStorage.getItem("readDocuments") === null) {
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
    }
})

// Check if array already has string
$("#accident").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("accident") === false) {
        hasRead.push("accident")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#discrimination").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("discrimination") === false) {
        hasRead.push("discrimination")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#attendance").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("attendance") === false) {
        hasRead.push("attendance")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#ethics").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("ethics") === false) {
        hasRead.push("ethics")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#communication").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("communication") === false) {
        hasRead.push("communication")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#travel").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("travel") === false) {
        hasRead.push("travel")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#disciplinary").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("disciplinary") === false) {
        hasRead.push("disciplinary")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#background").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("background") === false) {
        hasRead.push("background")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#break").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("break") === false) {
        hasRead.push("break")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#phone").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("phone") === false) {
        hasRead.push("phone")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#relatives").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("relatives") === false) {
        hasRead.push("relatives")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#equal").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("equal") === false) {
        hasRead.push("equal")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#fraternization").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("fraternization") === false) {
        hasRead.push("fraternization")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#holiday").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("holiday") === false) {
        hasRead.push("holiday")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#conduct").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("conduct") === false) {
        hasRead.push("conduct")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#internet").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("internet") === false) {
        hasRead.push("internet")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#jury").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("jury") === false) {
        hasRead.push("jury")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#new-hire").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("new-hire") === false) {
        hasRead.push("new-hire")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#open-door").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("open-door") === false) {
        hasRead.push("open-door")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#performance").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("performance") === false) {
        hasRead.push("performance")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#probationary").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("probationary") === false) {
        hasRead.push("probationary")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#prog-discipline").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("prog-discipline") === false) {
        hasRead.push("prog-discipline")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#seperation").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("seperation") === false) {
        hasRead.push("seperation")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#social").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("social") === false) {
        hasRead.push("social")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#substance").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("substance") === false) {
        hasRead.push("substance")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#development").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("development") === false) {
        hasRead.push("development")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#pto").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("pto") === false) {
        hasRead.push("pto")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#violence").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("violence") === false) {
        hasRead.push("violence")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

$("#retaliation").on("click", function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log(hasRead + "--------------------------")
    if (hasRead.includes("retaliation") === false) {
        hasRead.push("retaliation")
        localStorage.setItem("readDocuments", JSON.stringify(hasRead))
        console.log(hasRead)
        showCheckbox()
    }
})

var showCheckbox = function() {
    var retrievedData = localStorage.getItem("readDocuments")
    var hasRead = JSON.parse(retrievedData)
    console.log("Has Read: " + hasRead)
    console.log("******** " + hasRead.length + " ***********")
    if (hasRead.length === 30) {
        $("#policies-checkbox").css("display", "block")
    }
}

// $("#clear-storage").on("click", function() {
//     localStorage.clear()
//     alert("Local Storage Erased!")
// })

// Old firebase rules in case I fuck up

// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read;
//       allow write: if request.auth.uid == "x0Z60AxS46W3fVjF9nWzgFVHsI52";
//     }
//   }
// }