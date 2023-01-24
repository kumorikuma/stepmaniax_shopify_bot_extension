'use strict';

var quantityInput = document.getElementById("Quantity");
quantityInput.value = 2;
var addToCartBtn = document.getElementsByName("add")[0];
var productForm = document.getElementById("AddToCartForm");
if (addToCartBtn) {
	if (addToCartBtn.disabled) {
		chrome.runtime.sendMessage({event: "productUnavailable"});
	} else if (productForm) {
		chrome.runtime.sendMessage({event: "addedToCart"});
		productForm.submit();
	}
}