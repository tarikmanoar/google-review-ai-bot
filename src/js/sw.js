chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'options.html' });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openOptionsPage") {
        chrome.runtime.openOptionsPage();
    }
});


// background.js (or your background script)

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        const notificationOptions = {
            type: 'basic',
            iconUrl: 'images/icon48.png', // Replace with the path to your extension's icon
            title: 'Welcome to AI Reviews bot!',
            message: 'Supercharge your google review with power of AI.',
        };

        chrome.notifications.create('welcomeNotification', notificationOptions, function (notificationId) {
            // Handle the notification creation, if needed
            console.log('Notification created:', notificationId);
        });
    }
});


