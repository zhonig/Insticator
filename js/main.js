var columns = 4; //must implement css for columns greater than 4

window.addEventListener("load", function(event) {
	init();
	getStoreItems();
	createStoreItems();
});

function init(){
	var totalPrice = 0,
		totalItems = 0,
		cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] },
		totalElement = document.getElementsByClassName('total')[0];
	
	if(cart && cart.items && cart.items.length > 0){
		for(var i = 0; i < cart.items.length; i++) {
			totalItems++; //totalItems = totalItems + cart.items[i].cant;
			totalPrice = totalPrice + (cart.items[i].cant * cart.items[i].price);
		}
	}

	document.getElementsByClassName('totalItems')[0].innerText = totalItems;
	if(totalElement) totalElement.innerText = ('$' + parseFloat(totalPrice).toFixed(2));
}

function createStoreItems() {
	XHR('json/store_items.json', function (data) {
		data = data || null;
		var storeItems = JSON.parse(data);
		if(!storeItems || (storeItems && !storeItems.length)) alert("Out of business");
		
		var wrapper = document.getElementsByClassName('inventory-wrapper'),
			content = '',
			counter = 1;
			
		for(var i = columns; i > 0; i--) {
			content += '<div class="container' + i + '">';
		}

		for(var i = 0; i < storeItems.length; i++) {
			if(storeItems[i].quantityRemaining > 0) {
				var isMultiple = (i != 0 && i % columns == 0);
				if(isMultiple) {
					for(var j = 0; j < columns; j++) {
						content += '</div>';
					}
					for(var j = columns; j > 0; j--) {
						content += '<div class="container' + j + '">';
					}
					counter = 1;
				}
				content += '<div class="col' + counter + '">';
				content += '<img src="' + storeItems[i].imgSrc + '" alt="' + storeItems[i].itemName + '">';
				content += '<span class="product-details">';
				content += '<h3>' + storeItems[i].itemName + '</h3>';
				content += '<h3><span class="price">$ ' + parseFloat(storeItems[i].price).toFixed(2) + '</span> <span class="quantityRemaining">' + storeItems[i].quantityRemaining + ' In Stock</span></h3>';
				content += '<a class="btn prod-' + storeItems[i].id + '" onclick="addtoCart(' + storeItems[i].id + ');">Add to Cart</a>';
				content += '</span>';
				content += '</div>';
				counter++;
			}
		}
		wrapper[0].innerHTML = content;
		localStorage.setItem('storeItems', JSON.stringify(storeItems));
	});
}

function addtoCart(id){
	var storeItems = JSON.parse(localStorage.getItem('storeItems')),
		storeItem = searchArray('id', id, storeItems),
		cant = 1;
		
	if(cant <= storeItem.quantityRemaining){
		if(storeItem) {
			if(cant > 0) {
				var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] };
				searchStoreItems(cart, storeItem.id, parseInt(cant), storeItem.itemName, parseFloat(storeItem.price).toFixed(2), storeItem.imgSrc, storeItem.quantityRemaining);
			}
			else alert('Only quantities greater than zero are allowed');
		}
		else alert('Sorry, something went wrong. Please try again later');
	}
	else alert('Out of stock');
}

function searchStoreItems(cart, id, cant, itemName, price, imgSrc, quantityRemaining){
	var storeItem = searchArray('id', id, cart.items);

	if(storeItem){
		if(storeItem.cant < quantityRemaining) storeItem.cant = parseInt(storeItem.cant + cant);
		else alert('Out of stock');
	}
	else{
		cart.items.push({
			id: id,
			cant: cant,
			itemName: itemName,
			price : price,
			imgSrc : imgSrc,
			quantityRemaining : quantityRemaining
		});
	}
	localStorage.setItem('cart', JSON.stringify(cart));
	init();
	getStoreItems();
}

function getStoreItems(){
	var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] },
		msg = '',
		wrapper = document.querySelectorAll('ul.cart')[0],
		total = 0;
	
	wrapper.innerHTML = "";

	if(!cart || (cart && !cart.items) || (cart && cart.items && !cart.items.length)) {
		wrapper.innerHTML = "<li>Your Shopping Cart is Empty</li>";
		wrapper.style.left = "-500%";
		wrapper.style.top = "-10px";
	}
	else {
		var content = '';
		for(var i = 0; i < cart.items.length; i++) {
			total = total  + (cart.items[i].cant * cart.items[i].price);
			content += '<li>';
			content += '<img src="' + cart.items[i].imgSrc + '" />';
			content += '<h3 class="title"><span>' + cart.items[i].itemName + '</span><br><span class="price">' + cart.items[i].cant + ' x $' + parseFloat(cart.items[i].price).toFixed(2) + ' </span> <button title="Increase Item Quantity by 1" onclick="increaseItemQuantity(' + cart.items[i].id + ')">+</button> <button title="Decrease Item Quantity by 1" onclick="decreaseItemQuantity(' + cart.items[i].id + ')">-</button> <button title="Remove Item From Cart" onclick="removeFromCart(' + cart.items[i].id + ')" >x</button></h3>';
			content += '</li>';
		}

		content += '<li class="total">Total: $' + parseFloat(total).toFixed(2) + '<br>Items: ' + document.getElementsByClassName('totalItems')[0].innerText + ' <div class="submitForm"><button title="Confirm Purchase" type="submit" onclick="emptyCart();">Confirm Purchase</button></div></li>';
		wrapper.innerHTML = content;
		wrapper.style.left = "-500%";
		wrapper.style.top = "-10px";
	}
}

function increaseItemQuantity(id){
	var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] },
		storeItem = searchArray('id', id, cart.items);
		
	storeItem.cant = storeItem.cant + 1;
	if(storeItem.cant <= storeItem.quantityRemaining){
		localStorage.setItem('cart', JSON.stringify(cart));
		init();
		getStoreItems();
	}
	else alert("Out of Stock");
}

function decreaseItemQuantity(id){
	var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] },
		storeItem = searchArray('id', id, cart.items);
		
	storeItem.cant = storeItem.cant - 1;
	if(storeItem.cant > 0){
		localStorage.setItem('cart', JSON.stringify(cart));
		init();
		getStoreItems();
	}
	else removeFromCart(id);
}

function removeFromCart(id){
	if(id && id > 0){
		var conf = confirm('Are you sure you want to remove item from cart?');
		if(conf) {
			var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] };
			cart.items = cart.items.filter(function(item) { return item.id !== id; });
			localStorage.setItem('cart', JSON.stringify(cart));
			init();
			getStoreItems();
		}
	}
}

function emptyCart() {
	var cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { items : [] };
	cart.items = [];
	localStorage.setItem('cart', JSON.stringify(cart));
	init();
	getStoreItems();
}

function XHR(file, callback){
	/*
	In order for function XHR to work on local machine and Google Chrome browser, the user needs to disable Google Chrome security browser:
	1) Open Command Prompt
	2) Browse to Chrome Application. ie: cd C:\Program Files (x86)\Google\Chrome\Application
	3) Execute Chrome.exe without disabled web security. ie: chrome.exe --disable-web-security --user-data-dir
	4) Go to local website
	*/
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && (xhr.status === 0 || xhr.status === 200)) callback(xhr.responseText); // status 0 -- google chrome; status 200 -- mozilla firefox
    }
    xhr.open('GET', file, true);
    xhr.send();
}

function searchArray(key, value, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i][key] === value) {
            return myArray[i];
        }
    }
}