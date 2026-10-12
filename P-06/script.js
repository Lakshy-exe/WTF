
// =====================================================
// 1. setTimeout() - Display promotional message
// =====================================================

setTimeout(function () {

    document.getElementById("offer").innerHTML =
        "🎉 Special Offer: Get 20% OFF on selected travel packages!";

}, 3000);


// =====================================================
// 2. setInterval() - Dynamically update promotional message
// =====================================================

const offers = [
    "🎉 Get 20% OFF on Goa Packages!",
    "🏔️ Special Manali Package Available!",
    "🌴 Explore Kerala with WanderGo!",
    "🏰 Discover Jaipur at an amazing price!"
];

let offerIndex = 0;

setInterval(function () {

    document.getElementById("offer").innerHTML =
        offers[offerIndex];

    offerIndex++;

    if (offerIndex >= offers.length) {
        offerIndex = 0;
    }

}, 5000);


// =====================================================
// 3. Callback Function
// =====================================================

function performTask(taskName, callback) {

    console.log("Starting task: " + taskName);

    setTimeout(function () {

        console.log(taskName + " completed.");

        callback();

    }, 2000);
}


// Callback function execution

function firstTaskCompleted() {

    console.log("First asynchronous task completed.");

    performTask("Second Task", function () {

        console.log("All asynchronous tasks completed.");

    });
}


// Start callback demonstration

performTask("First Task", firstTaskCompleted);


// =====================================================
// 4. Fetch API - Retrieve JSON data
// =====================================================

async function loadPackages() {

    const container = document.getElementById("packageContainer");
    const loading = document.getElementById("loading");

    loading.innerHTML = "Loading packages...";
    container.innerHTML = "";

    try {

        const response = await fetch("packages.json");

        if (!response.ok) {
            throw new Error("JSON file could not be loaded");
        }

        const packages = await response.json();

        loading.innerHTML = "Packages loaded successfully!";

        packages.forEach(function (packageData) {

            const card = document.createElement("div");

            card.className = "package";

            card.innerHTML = `
                <h3>${packageData.destination}</h3>
                <p><b>Duration:</b> ${packageData.duration}</p>
                <p><b>Price:</b> ₹${packageData.price}</p>
                <p>${packageData.description}</p>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        loading.innerHTML =
            "Error loading travel packages: " + error.message;

    }
}


// =====================================================
// 5. Display JSON data dynamically
// =====================================================

function displayPackages(packages) {

    const container =
        document.getElementById("packageContainer");

    container.innerHTML = "";

    packages.forEach(function (pkg) {

        const card = document.createElement("div");

        card.className = "package";

        card.innerHTML = `
            <h3>${pkg.destination}</h3>

            <p>
                <strong>Duration:</strong>
                ${pkg.duration}
            </p>

            <p>
                <strong>Price:</strong>
                ₹${pkg.price}
            </p>

            <p>
                ${pkg.description}
            </p>

            <button
                onclick="selectDestination('${pkg.destination}')">
                Select
            </button>
        `;

        container.appendChild(card);

    });
}


// =====================================================
// 6. Select destination
// =====================================================

function selectDestination(destination) {

    document.getElementById("destination").value =
        destination;

    localStorage.setItem(
        "selectedDestination",
        destination
    );

    document.getElementById("preferenceMessage").innerHTML =
        "Selected destination: " + destination;

}


// =====================================================
// 7. Local Storage - Save Preferences
// =====================================================

function savePreferences() {

    const destination =
        document.getElementById("destination").value;

    const theme =
        document.getElementById("theme").value;


    // Save destination
    localStorage.setItem(
        "selectedDestination",
        destination
    );


    // Save theme
    localStorage.setItem(
        "preferredTheme",
        theme
    );


    applyTheme(theme);


    document.getElementById("preferenceMessage").innerHTML =
        "✅ Preferences saved successfully.";

}


// =====================================================
// 8. Retrieve Local Storage data
// =====================================================

function loadPreferences() {

    const savedDestination =
        localStorage.getItem("selectedDestination");

    const savedTheme =
        localStorage.getItem("preferredTheme");


    if (savedDestination) {

        document.getElementById("destination").value =
            savedDestination;

    }


    if (savedTheme) {

        document.getElementById("theme").value =
            savedTheme;

        applyTheme(savedTheme);

    }

}


// =====================================================
// Apply selected theme
// =====================================================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }

}


// =====================================================
// 9. Session Storage
// =====================================================

function startSession() {

    const sessionId =
        "WG-" + Math.floor(Math.random() * 100000);


    sessionStorage.setItem(
        "sessionId",
        sessionId
    );


    document.getElementById("sessionInfo").innerHTML =
        "Session started. Session ID: " + sessionId;

}


// =====================================================
// Retrieve Session Storage information
// =====================================================

function loadSession() {

    const sessionId =
        sessionStorage.getItem("sessionId");


    if (sessionId) {

        document.getElementById("sessionInfo").innerHTML =
            "Active Session ID: " + sessionId;

    } else {

        document.getElementById("sessionInfo").innerHTML =
            "No active session.";

    }

}


// =====================================================
// Execute when webpage loads
// =====================================================

window.addEventListener("load", function () {

    loadPreferences();

    loadSession();

});