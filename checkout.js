'use strict';

const checkoutButton = document.getElementsByName("checkout")[0];
if (checkoutButton) {
	chrome.runtime.sendMessage({event: "proceededToCheckout"});
    checkoutButton.click();
}