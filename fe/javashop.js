let btnMenu = document.getElementById('btn-menu');
let mainNav = document.getElementById('main-nav');
btnMenu.addEventListener('click', function(){
  mainNav.classList.toggle('mostrar');
});

document.addEventListener("keyup", e=> {

	if (e.target.matches("#buscador")) {

		if (e.key === "Escape")e.target.value = ""

		document.querySelectorAll(".product").forEach(fruit =>{
			fruit.textContent.toLowerCase().includes(e.target.value.toLowerCase())
			?fruit.classList.remove("filtro")
			:fruit.classList.add("filtro")
		})
	}
})
let carrito = [];
let productoList = [];
let order = {
	resultado:0,
	items: []
};

function agregar(productoId, precio) {
	const producto = productoList.find(p => p.id === productoId);
	const quantity = document.getElementById(`quantity_${productoId}`).value; // obtener la cantidad del input para ese productoId
	producto.stock = producto.stock - quantity; // restar quantity del stock, en lugar de restar 1.
	const productoInOrder = order.items.find((p) => p.id === productoId);
	if (productoInOrder) {
		productoInOrder.quantity = productoInOrder.quantity + parseInt(quantity); // sumar la cantidad seleccionada al producto ya en la orden
	} else {
		order.items.push({
			id: producto.id,
			name: producto.name,
			price: producto.price,
			quantity: parseInt(quantity), // agregar la cantidad seleccionada como quantity
		});
	}
	order.resultado = order.resultado + (precio * quantity); // El total es el precio del producto por la cantidad seleccionada
	document.getElementById("cart-icon").innerHTML = `Mostrar Orden $${order.resultado}`;
	displayProductos();
	alert("Producto Añadido Al Carrito");
}

	function añadir(productoId, precio) {

		const producto = productoList.find(p => p.id === productoId);
	
		if (producto.stock > 0) {
			producto.stock--;
			const productoInOrder = order.items.find((p) => p.id === productoId);
			if (productoInOrder) {
				productoInOrder.quantity = productoInOrder.quantity + 1;
			} else {
				order.items.push({
					id:producto.id,
					name:producto.name,
					price:producto.price,
					quantity:1,
				})
			}
			
			order.resultado = order.resultado + precio;
			document.getElementById("cart-icon").innerHTML = `Mostrar Orden $${order.resultado}`;
			showOrder();
		} else {
			alert("No hay suficiente stock para agregar este producto al carrito");
		}
	}

	function quitar(productoId, precio) {
		const productoInOrder = order.items.find((p) => p.id === productoId);
		const producto = productoList.find(p => p.id === productoId);
		producto.stock = producto.stock + productoInOrder.quantity;
		order.resultado = order.resultado - precio;
		document.getElementById("cart-icon").innerHTML = `Mostrar Orden $${order.resultado}`;
		productoInOrder.quantity = productoInOrder.quantity - 1;
		if (productoInOrder.quantity === 0) {
			const index = order.items.indexOf(productoInOrder);
			order.items.splice(index, 1);
		}
		showOrder();
	}

	function vaciar(productoId) {
		const index = order.items.findIndex(p => p.id === productoId);
		if (index !== -1) {
		  order.resultado -= order.items[index].price * order.items[index].quantity;
		  order.items.splice(index, 1);
		  showOrder();
		  document.getElementById("cart-icon").innerHTML = `Mostrar Orden $${order.resultado}`;
		}
	  }

async function showOrder() {
    document.getElementById("all-products").style.display = "none";
    document.getElementById("order").style.display = "block";
    document.getElementById("container-slider").style.display = "none";
	document.getElementById("h2").style.display = "none";
	document.getElementById("quitar").style.display = "none";
	document.getElementById("footer").style.display = "none";
    document.getElementById("order-total").innerHTML = `Total:$${order.resultado}`;

    let productosHTML = `
    <tr>
		<th>Imagen</th>
        <th>Cantidad</th>
        <th>Detalles</th>
        <th>Subtotal</th>
        <th>Añadir</th>
        <th>Quitar</th>
		<th>Vaciar</th>
    </tr>`
    ;
    order.items.forEach(p => {

        productosHTML +=
        `<tr>
		<div>
		<td><img src="${p.image}" alt="" class="product__img__cart"></td>
		</div>
            <td>${p.quantity}</td>
            <td>${p.name}</td>
            <td>$${p.price * p.quantity}</td>
			<td><i class="fa-solid fa-plus cart-remove" onclick="añadir(${p.id}, ${p.price})"></i></td>
			<td><i class="fa-solid fa-minus cart-remove" onclick="quitar(${p.id}, ${p.price})"></i></td>
            <td><i class="fa-solid fa-trash cart-remove" onclick="vaciar(${p.id}, ${p.price * p.quantity})"></i></td>
            

        </tr>`
    });
    document.getElementById('order-table').innerHTML = productosHTML;
}

async function pagar() {
	try{

		order.shipping = {
			name: document.getElementById("name").value,
			email: document.getElementById("email").value,
			phone: document.getElementById("phone").value,
			addressLine1: document.getElementById("addressLine1").value,
			addressLine2: document.getElementById("addressLine2").value,
			city: document.getElementById("city").value,
			postalCode: document.getElementById("postalCode").value,
			state: document.getElementById("state").value,
			country: document.getElementById("country").value,
		  };


        const preference = await (await fetch("/api/pagar",{
            method: "post",
            body: JSON.stringify(order),
            headers: {
                "Content-Type": "application/json"
            }
        })).json();

		var script = document.createElement("script");
  
        // The source domain must be completed according to the site for which you are integrating.
        // For example: for Argentina ".com.ar" or for Brazil ".com.br".
        script.src = "https://www.mercadopago.com.ar/integrations/v1/web-payment-checkout.js";
        script.type = "text/javascript";
        script.dataset.preferenceId = preference.preferenceId;
		script.setAttribute("data-button-label", "Pagar Con Mercado Pago");
        document.getElementById("order-actions").innerHTML = "";
        document.querySelector("#order-actions").appendChild(script);

		document.getElementById("name").disabled = true;
		document.getElementById("email").disabled = true;
		document.getElementById("phone").disabled = true;
		document.getElementById("addressLine1").disabled = true;
		document.getElementById("addressLine2").disabled = true;
		document.getElementById("city").disabled = true;
		document.getElementById("postalCode").disabled = true;
		document.getElementById("state").disabled = true;
		document.getElementById("country").disabled = true;

    }
	catch {
        window.alert("Fuera de stock");
    }

	order = {
		resultado:0,
		items: []
	};
    //await fetchProductos();
    document.getElementById("chequear").innerHTML = `Mostrar Orden $${order.resultado}`
}

//-----
function displayProductos() {
 
	document.getElementById("all-products").style.display = "grid";
    document.getElementById("order").style.display = "none";

	const guitars = productoList.filter((p) => p.category === "guitars");
	displayProductosByType(guitars,"product-cards-guitars");

	const bass = productoList.filter((p) => p.category === "bass");
	displayProductosByType(bass,"product-cards-bass");

	const drums = productoList.filter((p) => p.category === "drums");
	displayProductosByType(drums,"product-cards-drums");
}

function displayProductosByType(productosByType,tagId) {
	let productosHTML = '';
    productosByType.forEach((p) => {

		let botonHTML =`<button class="comprar blue add-cart" onclick="agregar(${p.id}, ${p.price})">AGREGAR AL CARRITO</button>`;

		if (p.stock <= 0) {
            botonHTML = `<button disabled class="blue add-cart disabled grey" onclick="agregar(${p.id}, ${p.price})">FUERA DE STOCK</button>`;
        }

        productosHTML +=
        `<div class="product">
		<img src="${p.image}" alt="" class="product__img">
		<div class="product__description">
			<h3 class="product__title">${p.name}</h3>
			<h4 class="cantidad">Disponibles (${p.stock})</h4>
			<span class="product__price">$${p.price}</span>
			<h3>Cantidad&nbsp;&nbsp;<input type="number" class="cart-quantity" value="1" min="1" max="${p.stock}" id="quantity_${p.id}"></h3>
		</div>
		<i class="product__icon fa-solid fa-cart-plus"></i><br><br>
		${botonHTML}
	</div>`
    });
    document.getElementById(tagId).innerHTML = productosHTML;
}

async function fetchProductos(){
    productoList = await (await fetch("/api/productos")).json();
    displayProductos();
}

window.onload = async() => {
    await fetchProductos();
}
