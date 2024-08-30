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

async function logout() {
    var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();
    fetch('https://api.amar.reviews/api/logout', {
        headers: {
            'Authorization': 'Bearer ' + token,
            'accept': 'application/json'
        },
        method: 'post',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            chrome.storage.local.remove(['_token', '_username', '_email', '_review_left'], function () {
                console.log('User logged out');
            });
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}


async function runContentScript() {
    var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();
    console.table([token, userName, userEmail, reviewLeft]);
    if (token) {
        const loginDiv = document.getElementById('rr-r-in');
        loginDiv.classList.add('rrhidden-section');
        const rrInstructionsDiv = document.getElementById('rr-r-in-con');
        rrInstructionsDiv.classList.remove('rrhidden-section');
        rrInstructionsDiv.querySelector('.rrReplyBlanace').textContent = reviewLeft;
        rrInstructionsDiv.querySelector('.rrName').textContent = userName;
    }


    const rLogoutBtn = document.getElementById('rLogoutBtn');
    rLogoutBtn.addEventListener('click', function (event) {
        event.preventDefault();
        logout();
        chrome.storage.local.remove([ '_token', '_username', '_email', '_review_left' ], function () {
            const loginDiv = document.getElementById('rr-r-in');
            loginDiv.classList.remove('rrhidden-section');
            const rrInstructionsDiv = document.getElementById('rr-r-in-con');
            rrInstructionsDiv.classList.add('rrhidden-section');
        });
    });

    // Set the current year in the footer
    const yearEL = document.getElementById('current-year');
    yearEL.textContent = new Date().getFullYear();
}

document.getElementById("google-login").addEventListener("click", () => {
    const manifest = chrome.runtime.getManifest();

    console.log(manifest.base_url);

    const clientId = manifest.oauth2.client_id;
    const scopes = manifest.oauth2.scopes.join(' ');
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org`;

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;

    console.table([authUrl, redirectUri, clientId, scopes]);

    chrome.identity.launchWebAuthFlow(
        {
            url: authUrl,
            interactive: true
        },
        function (redirectUri) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            // Extract the token from the redirectUri
            const accessToken = new URL(redirectUri).hash.match(/access_token=([^&]*)/)[1];
            // Fetch the user's basic profile information from Google API.
            fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                // Send the user details to your server.
                sendProfileToServer(data);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
        }
    );
});



async function sendProfileToServer(profileData) {
    const response = fetch('https://api.amar.reviews/api/google-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(profileData)
    }).then(response => response.json())
        .then(data => {
            setUserData(data);
            runContentScript();
        })
        .catch(error => {
            console.error('Error sending profile data to server:', error);
        });
}

runContentScript();
