// Run the script after the popup is loaded
document.addEventListener('DOMContentLoaded', function () {
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

    // Retrieve the access token from Chrome storage
    var rrToken = '';
    var rrName = '';
    var validToken = true;
    var rLogoutButton = document.getElementById('rLogoutBtn');
    rLogoutButton.classList.add('hidden-section');
    const createAccBtn = document.getElementById('createAccBtn');
    const loginBtn = document.getElementById('loginBtn');

    const loginDiv = document.getElementById('loginDiv');
    const instructionsDiv = document.getElementById('instructionsDiv');
    const regDiv = document.getElementById('regDiv');

    chrome.storage.local.get(['_username'], function (nameResult) {
        rrName = nameResult._username;
        if (rrName) {
            const nameElement = document.getElementsByClassName('rrName');
            nameElement[0].textContent = rrName;
        }
    });

    chrome.storage.local.get(['_token'], function (tokenResult) {
        rrToken = tokenResult._token;
        if (rrToken) {
            loginDiv.classList.add('hidden-section');
            rLogoutButton.classList.remove('hidden-section');
        } else {
            instructionsDiv.classList.add('hidden-section');
            rLogoutButton.classList.add('hidden-section');
        }
    });

    createAccBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginDiv.classList.add('hidden-section');
        regDiv.classList.remove('hidden-section');

    });

    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginDiv.classList.remove('hidden-section');
        regDiv.classList.add('hidden-section');
    });

    async function logout() {
        var { token, userName, userEmail, reviewLeft } = await getLocalStorageValues();
        fetch('https://api.amar.reviews/api/logout', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'accept': 'application/json'
            },
            method: 'get',
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

    rLogoutButton.addEventListener('click', function () {
        logout();
        chrome.storage.local.remove(['_token', '_username', '_email', '_review_left'], function () {
            const element = document.getElementById('instructionsDiv');
            element.classList.add('hidden-section');
            const loginDiv = document.getElementById('loginDiv');
            loginDiv.classList.remove('hidden-section');
            rLogoutButton.classList.add('hidden-section');
        });
    });

    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const loginName = document.getElementById('loginName').value;
        const loginPassword = document.getElementById('loginPassword').value;

        try {
            var formdata = new FormData();
            formdata.append("email", loginName);
            formdata.append("password", loginPassword);
            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow',
                headers: {
                    accept: 'application/json'
                },
            };
            const response = await fetch('https://api.amar.reviews/api/login', requestOptions);

            if (response.ok) {
                const data = await response.json();
                document.getElementById('response').textContent = `Welcome, ${data.user.name}}!`;
                // Store the access token in Chrome storage
                setUserData(data);
                const element = document.getElementById('loginDiv');
                element.classList.add('hidden-section');
                const inselement = document.getElementById('instructionsDiv');
                inselement.classList.remove('hidden-section');
                rLogoutButton.classList.remove('hidden-section');
                // Perform any necessary actions after successful authentication
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            document.getElementById('response').textContent = 'Authentication failed';
        }
    });


    document.getElementById('regForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const useremail = document.getElementById('useremail').value;
        const password = document.getElementById('password').value;
        const password_confirmation = document.getElementById('password_confirmation').value;

        try {
            var formdata = new FormData();
            formdata.append("name", username);
            formdata.append("email", useremail);
            formdata.append("password", password);
            formdata.append("password_confirmation", password_confirmation);

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow',
                headers: {
                    accept: 'application/json'
                },
            };
            const response = await fetch('https://api.amar.reviews/api/register', requestOptions);

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                let regErrors = '';
                if (data.status != 200) {
                    for (const key in data.errors) {
                        if (Object.hasOwnProperty.call(data.errors, key)) {
                            const value = data.errors[key];
                            regErrors += `<p class="error" style="color:red;">${key} -  ${value}</p> `;
                            console.log(`Key: ${key}, Value: ${value}`);
                        }
                    }

                    document.getElementById('regResponse').innerHTML = regErrors;
                } else {
                    document.getElementById('response').textContent = `Welcome, ${data.user.name}}!`;
                    // Store the access token in Chrome storage
                    setUserData(data);

                    let rrName = document.getElementsByClassName('rrName');
                    rrName[0].textContent = data.user.name;

                    regDiv.classList.add('hidden-section');
                    instructionsDiv.classList.remove('hidden-section');
                    rLogoutButton.classList.remove('hidden-section');
                    // Perform any necessary actions after successful authentication
                }
            }
        } catch (error) {
            document.getElementById('regResponse').innerHTML = error;
        }
    });
}, { capture: true });
