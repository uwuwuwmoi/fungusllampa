// --- CONFIGURACIÓN ---
// Tu número de WhatsApp (formato internacional sin el +)
const phoneNumber = "51966756553";

// --- VARIABLES GLOBALES ---
let cart = []; // Aquí guardaremos los productos
let currentProduct = {}; // Producto seleccionado actualmente en el modal

// --- FUNCIONES DEL MODAL DE PRODUCTO ---

function openModal(element) {
  const modal = document.getElementById("productModal");

  // Guardamos los datos actuales para usarlos luego al añadir al carrito
  currentProduct = {
    name: element.getAttribute("data-name"),
    priceText: element.getAttribute("data-price"), // El texto "S/.50"
    // Convertimos el precio a número para poder sumar (quitamos "S/.")
    priceValue: parseFloat(
      element.getAttribute("data-price").replace("S/.", "")
    ),
    img: element.getAttribute("data-img"),
  };

  // Llenamos el modal visualmente
  document.getElementById("modal-title").innerText = currentProduct.name;
  document.getElementById("modal-price").innerText = currentProduct.priceText;
  document.getElementById("modal-img").src = currentProduct.img;
  document.getElementById("modal-desc").innerText =
    element.getAttribute("data-desc");

  // Reseteamos el select de variedad a la primera opción
  document.querySelector(".modal-selectors select").selectedIndex = 0;

  // Mostramos el modal
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// Cerramos si hacen clic fuera de la cajita blanca (en el fondo oscuro)
window.onclick = function (event) {
  const productModal = document.getElementById("productModal");
  const cartModal = document.getElementById("cartModal");
  if (event.target == productModal) {
    productModal.style.display = "none";
  }
  if (event.target == cartModal) {
    cartModal.style.display = "none";
  }
};

// --- LÓGICA DEL CARRITO ---

// 1. Añadir al carrito desde el botón del modal
document.querySelector(".add-cart-btn").addEventListener("click", function () {
  // Obtenemos la variedad seleccionada
  const varietySelect = document.querySelector(".modal-selectors select");
  const selectedVariety =
    varietySelect.options[varietySelect.selectedIndex].text;

  // Creamos el item del pedido
  const item = {
    id: Date.now(), // ID único basado en la hora actual
    name: currentProduct.name,
    price: currentProduct.priceValue,
    variety: selectedVariety,
  };

  // Lo metemos al array del carrito
  cart.push(item);

  // Actualizamos todo y cerramos el modal
  updateCartUI();
  closeModal();

  // Abrimos el carrito automáticamente para que vean que se guardó (opcional)
  toggleCart();
});

// 2. Abrir/Cerrar la ventana del Carrito
function toggleCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal.style.display === "flex") {
    cartModal.style.display = "none";
  } else {
    cartModal.style.display = "flex";
    renderCartItems(); // Dibujamos la lista al abrir
  }
}

// 3. Dibujar los items en el HTML del carrito
function renderCartItems() {
  const container = document.getElementById("cart-items");
  container.innerHTML = ""; // Limpiamos lo que había antes

  if (cart.length === 0) {
    container.innerHTML = "<p class='empty-msg'>Tu carrito está vacío.</p>";
    document.getElementById("cart-total").innerText = "S/.0.00";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price;

    // Creamos el HTML para cada producto en la lista
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="item-info">
        <h4>${item.name}</h4>
        <span>${item.variety}</span>
        <div><strong>S/.${item.price.toFixed(2)}</strong></div>
      </div>
      <span class="remove-item" onclick="removeFromCart(${item.id})">🗑️</span>
    `;
    container.appendChild(div);
  });

  // Actualizar el Total final
  document.getElementById("cart-total").innerText = "S/." + total.toFixed(2);
}

// 4. Actualizar el numerito rojo del icono
function updateCartUI() {
  document.getElementById("cart-count").innerText = cart.length;
}

// 5. Eliminar un item específico (tacho de basura)
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCartItems(); // Volver a dibujar la lista
  updateCartUI(); // Actualizar contador
}

// 6. Vaciar todo el carrito
function clearCart() {
  cart = [];
  renderCartItems();
  updateCartUI();
}

// 7. ENVIAR PEDIDO A WHATSAPP (CHECKOUT)
function sendToWhatsapp() {
  if (cart.length === 0) {
    alert("El carrito está vacío, agrega productos primero.");
    return;
  }

  // Inicio del mensaje
  let message = "Hola FungusLlampa, quiero realizar el siguiente pedido:%0A%0A";
  let total = 0;

  // Recorremos el carrito para listar los productos
  cart.forEach((item, index) => {
    total += item.price;
    // Formato: 1. Producto - Variedad (Precio)
    message += `${index + 1}. *${item.name}* - ${item.variety} (S/.${
      item.price
    })%0A`;
  });

  // Agregamos el total y la pregunta final
  message += `%0A*TOTAL: S/.${total.toFixed(2)}*%0A%0A`;
  message += "¿Cuál es el método de pago?";

  // Abrir WhatsApp en nueva pestaña
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
