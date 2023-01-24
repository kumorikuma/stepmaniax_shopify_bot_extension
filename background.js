// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var activeTabId = null;

function tryAddToCartOnPageLoad(tabId, changeInfo, tab) {
    console.log("Page Load: " + tab.id);
    if (changeInfo.status == "complete" && tab.id == activeTabId) {
        console.log("tryAddToCartOnPageLoad: " + tab.id);
        chrome.tabs.onUpdated.removeListener(tryAddToCartOnPageLoad);
        chrome.tabs.executeScript(activeTabId, {
            file: 'addToCart.js'
        });
    }
}

function proceedToCheckoutOnPageLoad(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete" && tab.id == activeTabId) {
        console.log("proceedToCheckoutOnPageLoad: " + tab.id);
        chrome.tabs.onUpdated.removeListener(proceedToCheckoutOnPageLoad);
        chrome.tabs.executeScript(activeTabId, {
            file: 'checkout.js'
        });
        chrome.storage.local.set({isRunning: false});
    }
}

function terminateLoop() {
    console.log("Stopping loop...");
    activeTabId = null;
    chrome.tabs.onUpdated.removeListener(proceedToCheckoutOnPageLoad);
    chrome.tabs.onUpdated.removeListener(tryAddToCartOnPageLoad);
    chrome.storage.local.set({isRunning: false});
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.event == "setActiveTab") {
            chrome.storage.local.set({isRunning: true});
            activeTabId = request.tabId;
            console.log("Set Active Tab: " + activeTabId);
        } else if (request.event == "stop") {
            terminateLoop();
        } else if (request.event == "productUnavailable") {
            chrome.tabs.onUpdated.addListener(tryAddToCartOnPageLoad);
            chrome.tabs.reload(activeTabId);
        } else if (request.event == "addedToCart") {
            chrome.tabs.onUpdated.addListener(proceedToCheckoutOnPageLoad);
        } else if (request.event == "proceededToCheckout") {
            // Do nothing
        }
    }
);

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'shop.steprevolution.com' },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});