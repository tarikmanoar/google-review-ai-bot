async function openOptionsPage(e) {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
}

function getLocalStorageValues() {// Function to get values from localStorage and return a Promise
    return new Promise((resolve) => {
        chrome.storage.local.get(['_token', '_username', '_email', '_review_left'], function (result) {
            const token = result._token || '';
            const userName = result._username || 'User';
            const userEmail = result._email || 'user@example.com';
            const reviewLeft = result._review_left || 0;

            resolve({ token, userName, userEmail, reviewLeft });
        });
    });
}

function setUserData(data) {// Store the access token in Chrome storage
    chrome.storage.local.set({ _token: data.token }, function () { });
    chrome.storage.local.set({ _username: data.user.name }, function () { });
    chrome.storage.local.set({ _email: data.user.email }, function () { });
    chrome.storage.local.set({ _review_left: data.reviewCount }, function () { });
}

async function login(credentials) {
    try {
        let formdata = new FormData();
        formdata.append("email", credentials.email);
        formdata.append("password", credentials.password);
        let requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
            headers: {
                accept: "application/json",
            },
        };
        const response = await fetch("https://api.amar.reviews/api/login",requestOptions);

        if (response.status == 200) {
            const data = await response.json();
            let planName = data.plan_name;
            let th = data.th;
            let replies = data.replies;
            document.getElementById("rrPopName").textContent = ` ${data.user.name}`;
            setUserData(data);

            const rrRegDiv = document.getElementById("rrRegDiv");
            rrRegDiv.classList.add("rrhidden-section");

            const rrLoginDiv = document.getElementById("rrLoginDiv");

            rrLoginDiv.classList.add("rrhidden-section");

            const rLogoutButtonCon = document.getElementById("rLogoutButtonCon");
            rLogoutButtonCon.classList.remove("rrhidden-section");

            const rrReplyBtn = document.getElementById("rrReplyBtn");
            rrReplyBtn.setAttribute("data-rAction", "rrReply");

            // Perform any necessary actions after successful authentication
        } else {
            throw new Error("Authentication failed");
        }
    } catch (error) {
        document.getElementById("rrResponse").textContent = "Authentication failed";
    }
}

async function register(credentials) {
    try {
        let formdata = new FormData();
        formdata.append("email", credentials.email);
        formdata.append("name", credentials.name);
        formdata.append("password", credentials.password);
        formdata.append("password_confirmation", credentials.password_confirmation);
        let requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
            headers: {
                accept: "application/json",
            },
        };
        const response = await fetch("https://api.amar.reviews/api/register",requestOptions);

        if (response.status == 200) {
            const data = await response.json();
            console.log(data);
            document.getElementById("rrPopName").textContent = ` ${data.user.name}`;
            // Store the access token in Chrome storage
            setUserData(data);

            const rrLoginDiv = document.getElementById("rrLoginDiv");
            rrLoginDiv.classList.add("rrhidden-section");

            const rrRegDiv = document.getElementById("rrRegDiv");
            rrRegDiv.classList.add("rrhidden-section");

            const rLogoutButtonCon = document.getElementById("rLogoutButtonCon");
            rLogoutButtonCon.classList.remove("rrhidden-section");
            if (data.status == 200) {
            } else {
                let regErrors = "";
                for (const key in data.errors) {
                    if (Object.hasOwnProperty.call(data.errors, key)) {
                        const value = data.errors[key];

                        regErrors += `<p class="error" style="color:red;">${key} -  ${value}</p> `;
                    }
                }
                document.getElementById("rrRegResponse").innerHTML = regErrors;
            }
        } else {
            throw new Error("Authentication failed");
        }
    } catch (error) {
        document.getElementById("rrRegResponse").textContent =
            "This email is already registered!";
    }
}

// content.js

// Function to inject a button
function injectButton(targetNode) {
    // const button = document.createElement("button");
    // button.innerText = "Click Me";
    // button.addEventListener("click", () => alert("Button Clicked!"));
    // targetNode.appendChild(button);
    console.log("button added");
}

// Observe DOM changes
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Customize your condition to inject button
                    if (node.matches(".VfPpkd-NSFCdd-i5vt6e") || node.matches(".m6QErb.WNBkOb.XiKgde")) {
                        runContentScript();
                    }
                }
            });
        }
    }
});

// Start observing the document body for child node changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial check for pre-existing dynamically loaded content
document.querySelectorAll(".VfPpkd-NSFCdd-i5vt6e").forEach(injectButton);

// Asynchronous function to run the main content script logic
async function runContentScript() {
    // Wait for the values to be retrieved from localStorage
    var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();

    const nodeCategory = document.querySelector("button.DkEaL");
    if (nodeCategory) {
        localStorage.setItem("category", nodeCategory.textContent);
    }

    // Find the element with the specified class
    //VfPpkd-fmcmS-yrriRe-JZnCve-gmhCAd //For Business Reply
    const targetElement = document.querySelector(".VfPpkd-NSFCdd-i5vt6e");
    if (targetElement) {
        // Create the outer <div>
        const outerDiv = document.createElement("div");
        outerDiv.classList.add("outer-div"); // Add a class for styling

        // Create the inner <div>
        const innerDiv = document.createElement("div");
        innerDiv.classList.add("inner-div"); // Add a class for styling

        // Create the <a> tag
        const rrReplyLink = document.createElement("a");
        rrReplyLink.href = "#"; // Replace with appropriate link URL
        rrReplyLink.setAttribute("id", "rrReplyBtn");
        rrReplyLink.setAttribute("data-rAction", "rrpop");
        // Create the image element
        const image = document.createElement("img");
        image.src = chrome.runtime.getURL("images/icon32.png"); // Replace with the path to your image
        image.alt = "reply reviews AI"; // Replace with appropriate alt text

        // Append the image to the <a> tag
        rrReplyLink.appendChild(image);

        // Append the <a> tag to the inner <div>
        innerDiv.appendChild(rrReplyLink);

        // Append the inner <div> to the outer <div>
        outerDiv.appendChild(innerDiv);
        targetElement.insertAdjacentElement("afterend", outerDiv);

        // Create the outer <div>
        const spinOuterDiv = document.createElement("div");
        spinOuterDiv.id = "loadingPopup";
        spinOuterDiv.style.display = "none";

        const spinerDiv = document.createElement("div");
        spinerDiv.classList.add("spinner");

        spinOuterDiv.appendChild(spinerDiv);
        targetElement.insertAdjacentElement("afterend", spinOuterDiv);

        rrReplyLink.addEventListener("click", replyBtnAction);
    }

    async function replyBtnAction(e) {
        getReply(e);
    }
    async function getReply(e) {
        e.preventDefault();

        var currentElement = e.target;
        var parents = [];

        // Traverse the DOM tree until reaching the topmost parent (document)
        while (currentElement !== document) {
            if (currentElement.classList.contains("J7elmb")) {
                parents.push(currentElement);
            }
            currentElement = currentElement.parentNode;
        }

        const place = document.querySelector("h2.Ku5dzd").textContent;
        const rating = document.querySelector(".lv4IMd.UuEGge").getAttribute("data-rating");
        console.log(rating);
        const category = localStorage.getItem("category") ?? 'Restaurant';

        (async function () {
            try {
                if (token) {
                var formdata = new FormData();
                formdata.append("place", place);
                formdata.append("rating", rating ?? 5);
                formdata.append("category", category);
                formdata.append("type", 'review');
                var loadingPopup = document.getElementById("loadingPopup");
                loadingPopup.style.display = "flex";
                // Make a request to the API using the token
                const response = await fetch("https://api.amar.reviews/api/gemini", {
                    headers: {
                        Authorization: "Bearer " + token,
                        accept: "application/json",
                        'X-Gen-Token': 'fahrik-ai'
                    },
                    method: "POST",
                    body: formdata
                });
                const data = await response.json();
                console.log(data);
                const gReviewTextArea = document.querySelector("textarea.VfPpkd-fmcmS-wGMbrd");
                console.log(gReviewTextArea);
                gReviewTextArea.focus();
                gReviewTextArea.cols = 5;
                //gReplyBtn.removeAttribute('disabled')
                gReviewTextArea.style.height = "100px";

                if (data.status == 200) {
                    gReviewTextArea.value = data.review;
                    chrome.storage.local.set({ rrRepliesLeft: data.review },
                        function () {
                            console.log("Value is set to " + data.review);
                        });
                } else {
                    gReviewTextArea.value = data.message;
                }
                // Close the popup
                loadingPopup.style.display = "none";
                // Perform further actions with the response data
            } else {
                // Token not found in storage
                const destElement = document.querySelector(".VfPpkd-fmcmS-wGMbrd.ZUPIVd");
                openPopup(e);
                destElement.textContent = "Authentication failed. Please login to the Extension first!";
            }
            } catch (error) {
                console.error("API Request Error:", error);
            }
        })();
    }

    // Function to open the login/register popup
    async function openPopup(e) {
        e.preventDefault();
        var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();

        // Create the modal container
        const modalContainer = document.createElement("div");
        modalContainer.className = "modal-container";
        modalContainer.innerHTML = `
            <div class="modal">
              <!-- Content will be inserted here -->
            </div>
          `;

        // Append the modal container to the body
        document.body.appendChild(modalContainer);

        // Load the popup.html content into the modal
        fetch(chrome.runtime.getURL("login.html"))
            .then((response) => response.text())
            .then((html) => {
                const tempContainer = document.createElement("div");
                tempContainer.innerHTML = html;
                const modalContent = tempContainer.querySelector(".modal-content");

                const modal = modalContainer.querySelector(".modal");

                modal.appendChild(modalContent);

                // Show the modal
                modal.style.display = "block";
                const closeBtn = modalContainer.querySelector(".rrCloseBtn");

                // Add event listener to close the modal when clicking outside
                closeBtn.addEventListener("click", function (event) {
                    modalContainer.remove();
                });

                if (token) {
                    const rrLoginDiv = document.getElementById("rrLoginDiv");
                    rrLoginDiv.classList.add("rrhidden-section");

                    const rrInstructionsDiv =
                        document.getElementById("rrInstructionsDiv");
                    rrInstructionsDiv.classList.remove("rrhidden-section");

                    const rLogoutButtonCon = document.getElementById("rLogoutButtonCon");
                    rLogoutButtonCon.classList.remove("rrhidden-section");

                    const rrRegDiv = document.getElementById("rrRegDiv");
                    rrRegDiv.classList.add("rrhidden-section");
                    let rrLogoCon = modalContainer.querySelector(".rrLogoCon");
                    const logoImage = document.createElement("img");
                    logoImage.src = chrome.runtime.getURL("images/icon32.png");

                    rrLogoCon.insertBefore(logoImage, rrLogoCon.firstChild);

                    modalContainer.querySelector(".rrName").textContent = userName;
                    modalContainer.querySelector(".rrPlanText").textContent = plan;
                    modalContainer.querySelector(".rrReplyBlanace").textContent =
                        repliesLeft;
                    let rrUpgradeBox = modalContainer.querySelector(".rrUpgradeBox");
                    if (plan == "stater" || plan == "Starter") {
                        rrUpgradeBox.classList.remove("rrhidden-section");
                    } else {
                        rrUpgradeBox.classList.add("rrhidden-section");
                    }

                    let upgradeBtn = rrInstructionsDiv.querySelector(".rrUpgradeButton");
                    if (upgradeBtn) {
                        upgradeBtn.href = "https://api.amar.reviews/upgrade/" + rrTh;
                    }
                    // check and update
                    fetch("https://api.amar.reviews/api/check", {
                        headers: {
                            Authorization: "Bearer " + token,
                            accept: "application/json",
                        },
                        method: "get",
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.status) {
                                data.token = token;
                                data.rrTh = rrTh;
                                data.user = {};
                                data.user.name = userName;
                                setUserData(data);
                                modalContainer.querySelector(".rrPlanText").textContent =
                                    data.plan_name;
                                modalContainer.querySelector(".rrReplyBlanace").textContent =
                                    data.replies;
                            }
                        })
                        .catch((error) => {
                            console.error("error", error);
                        });
                }

                // Add event listeners to handle login and register requests
                const loginForm = document.getElementById("rrLoginForm");
                loginForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    const credentials = {
                        email: event.target.loginName.value,
                        password: event.target.loginPassword.value,
                    };
                    login(credentials);
                });

                const registerForm = document.getElementById("rrRegForm");
                registerForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    const credentials = {
                        name: event.target.rrUserName.value,
                        email: event.target.rrUserEmail.value,
                        password: event.target.rrPassword.value,
                        password_confirmation: event.target.rrpassword_confirmation.value,
                    };
                    register(credentials);
                });

                const rrCreateAccBtn = document.getElementById("rrCreateAccBtn");
                rrCreateAccBtn.addEventListener("click", function (event) {
                    event.preventDefault();

                    const rrLoginDiv = document.getElementById("rrLoginDiv");
                    rrLoginDiv.classList.add("rrhidden-section");

                    const rrInstructionsDiv =
                        document.getElementById("rrInstructionsDiv");
                    rrInstructionsDiv.classList.add("rrhidden-section");

                    const rLogoutButtonCon = document.getElementById("rLogoutButtonCon");
                    rLogoutButtonCon.classList.add("rrhidden-section");

                    const rrRegDiv = document.getElementById("rrRegDiv");
                    rrRegDiv.classList.remove("rrhidden-section");
                });

                const rrLoginBtn = document.getElementById("rrLoginBtn");
                rrLoginBtn.addEventListener("click", function (event) {
                    event.preventDefault();

                    const rrLoginDiv = document.getElementById("rrLoginDiv");
                    rrLoginDiv.classList.remove("rrhidden-section");

                    const rrInstructionsDiv =
                        document.getElementById("rrInstructionsDiv");
                    rrInstructionsDiv.classList.add("rrhidden-section");

                    const rLogoutButtonCon = document.getElementById("rLogoutButtonCon");
                    rLogoutButtonCon.classList.add("rrhidden-section");

                    const rrRegDiv = document.getElementById("rrRegDiv");
                    rrRegDiv.classList.add("rrhidden-section");
                });

                async function logout() {
                    var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();

                    fetch("https://api.amar.reviews/api/logout", {
                        headers: {
                            Authorization: "Bearer " + token,
                            accept: "application/json",
                        },
                        method: "get",
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.status) {
                                chrome.storage.local.remove(
                                    ["token", "userName", "userEmail", "reviewLeft"],
                                    function () {
                                        console.log("User logged out");
                                    }
                                );
                            }
                        })
                        .catch((error) => { });
                }

                const rLogoutBtn = document.getElementById("rLogoutBtn");
                rLogoutBtn.addEventListener("click", function (event) {
                    event.preventDefault();
                    logout();
                    chrome.storage.local.remove(["token", "userName", "userEmail", "reviewLeft"],
                        function () {
                            const rrLoginDiv = document.getElementById("rrLoginDiv");
                            rrLoginDiv.classList.remove("rrhidden-section");

                            const rrInstructionsDiv =
                                document.getElementById("rrInstructionsDiv");
                            rrInstructionsDiv.classList.add("rrhidden-section");

                            const rLogoutButtonCon =
                                document.getElementById("rLogoutButtonCon");
                            rLogoutButtonCon.classList.add("rrhidden-section");

                            const rrRegDiv = document.getElementById("rrRegDiv");
                            rrRegDiv.classList.add("rrhidden-section");
                        }
                    );
                });
            });
    }
}

// Call the main function to run the content script
runContentScript();
