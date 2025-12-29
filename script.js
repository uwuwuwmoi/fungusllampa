// --- CONFIGURACIÓN ---
const phoneNumber = "51966756553";

// --- DATOS DE VARIANTES (Lógica de Precios y Textos) ---
const productVariants = {
  // Lógica para CHOCOHONGOS
  chocohongos: {
    options: ["Cepa Clásica", "Cepa Exótica"],
    details: {
      "Cepa Clásica": {
        priceMod: 0, // Precio base
        text: "La opción ideal para empezar. Utilizamos genéticas como Golden Teacher o B+, conocidas por sus efectos equilibrados, risueños y de profunda conexión emocional sin ser abrumadores.",
      },
      "Cepa Exótica": {
        priceMod: 15, // Suma 15 soles al precio base
        text: "Para psiconautas que buscan más intensidad. Utilizamos genéticas híbridas o mutaciones (como Melmak o Jack Frost) que ofrecen una potencia visual superior y un viaje más profundo con la misma cantidad de chocolate.",
      },
    },
  },
  // Lógica para CEPAS
  cepas: {
    options: ["Cultura Líquida (LC)", "Grano (Spawn)", "Kit de Cultivo"],
    details: {
      "Cultura Líquida (LC)": {
        fixedPrice: 70,
        text: "Jeringa de 10ml con micelio vivo suspendido en solución nutritiva. Ideal para inocular tus propios frascos de grano estéril. Genética aislada en agar para máxima pureza.",
      },
      "Grano (Spawn)": {
        fixedPrice: 90,
        text: "Bolsa de 1kg de grano (trigo/maíz) totalmente colonizado por el micelio. Listo para mezclar con sustrato (fibra de coco) y fructificar. Ahorras semanas de trabajo.",
      },
      "Kit de Cultivo": {
        fixedPrice: 180,
        text: "La solución todo en uno. Incluye grano colonizado, sustrato estéril, caja de fructificación y manual. La forma más sencilla de cultivar tus propios hongos en casa sin laboratorio.",
      },
    },
  },
  // Lógica por defecto (Dosis)
  default: {
    options: ["Elige por mí (Recomendado)", "Elegir cepas en Whatsapp"],
    details: {}, // Usa la descripción base del HTML
  },
};

// --- VARIABLES GLOBALES ---
let cart = JSON.parse(localStorage.getItem("magikCart")) || [];
let currentProduct = {};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});

function saveCart() {
  localStorage.setItem("magikCart", JSON.stringify(cart));
}

// --- FUNCIONES DEL MODAL ---

function openModal(element) {
  const modal = document.getElementById("productModal");
  const category = element.getAttribute("data-category") || "default";

  // Guardamos datos base
  currentProduct = {
    name: element.getAttribute("data-name"),
    basePrice: parseFloat(
      element.getAttribute("data-price").replace("S/.", "")
    ),
    baseDesc: element.getAttribute("data-desc"), // Descripción original del HTML
    img: element.getAttribute("data-img"),
    category: category,
  };

  // Llenar datos visuales iniciales
  document.getElementById("modal-title").innerText = currentProduct.name;
  document.getElementById("modal-img").src = currentProduct.img;

  // Configurar el Select (Dropdown)
  setupVariantSelect(category);

  modal.style.display = "flex";
}

function setupVariantSelect(category) {
  const select = document.getElementById("variant-select");
  const label = document.getElementById("selector-label");
  select.innerHTML = ""; // Limpiar opciones anteriores

  let variantInfo = productVariants[category] || productVariants.default;

  // Si es Dosis, ocultamos label específico o ponemos uno genérico
  if (category === "default") {
    label.innerText = "Variedad:";
  } else if (category === "chocohongos") {
    label.innerText = "Tipo de Genética:";
  } else {
    label.innerText = "Formato:";
  }

  // Crear las opciones del select
  variantInfo.options.forEach((opt) => {
    const optionElement = document.createElement("option");
    optionElement.value = opt;
    optionElement.innerText = opt;
    select.appendChild(optionElement);
  });

  // Listener para cuando cambie la opción
  select.onchange = () => updateModalDetails(category, select.value);

  // Ejecutar una vez al inicio para poner el precio/texto correcto de la primera opción
  updateModalDetails(category, select.value);
}

function updateModalDetails(category, selectedOption) {
  const priceElement = document.getElementById("modal-price");
  const descElement = document.getElementById("modal-desc");

  // Lógica Dosis (Default)
  if (category === "default") {
    priceElement.innerText = "S/." + currentProduct.basePrice.toFixed(2);
    descElement.innerHTML = currentProduct.baseDesc; // Usa el texto del HTML (que ya incluye el párrafo extra)
    return;
  }

  // Lógica Chocohongos y Cepas
  const details = productVariants[category].details[selectedOption];

  if (details) {
    // Calcular Precio
    let finalPrice = 0;
    if (details.fixedPrice) {
      finalPrice = details.fixedPrice; // Precio fijo (Cepas)
    } else {
      finalPrice = currentProduct.basePrice + (details.priceMod || 0); // Precio base + modificador (Chocos)
    }

    // Actualizar UI
    priceElement.innerText = "S/." + finalPrice.toFixed(2);

    // Actualizar Descripción
    // Para Chocohongos, mostramos la descripción base del producto + la explicación de la variante
    if (category === "chocohongos") {
      descElement.innerHTML = `<p>${currentProduct.baseDesc}</p><br><p><strong>Sobre tu elección:</strong> ${details.text}</p>`;
    } else {
      // Para Cepas, reemplazamos totalmente el texto según el formato (Kit vs LC)
      descElement.innerHTML = details.text;
    }

    // Actualizamos el objeto global para cuando se añada al carrito
    currentProduct.currentPrice = finalPrice;
  }
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

window.onclick = function (event) {
  const productModal = document.getElementById("productModal");
  const cartModal = document.getElementById("cartModal");
  if (event.target == productModal) productModal.style.display = "none";
  if (event.target == cartModal) cartModal.style.display = "none";
};

// --- AÑADIR AL CARRITO ---
document.querySelector(".add-cart-btn").addEventListener("click", function () {
  const select = document.getElementById("variant-select");
  const selectedVariety = select.value;

  // Usamos el precio calculado actualmente o el base si no hay cálculo
  const priceToAdd = currentProduct.currentPrice || currentProduct.basePrice;

  const item = {
    id: Date.now(),
    name: currentProduct.name,
    price: priceToAdd,
    variety: selectedVariety,
  };

  cart.push(item);
  saveCart();
  updateCartUI();
  closeModal();
  toggleCart();
});

// --- RESTO DEL CÓDIGO DEL CARRITO (Igual que antes) ---
function toggleCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal.style.display === "flex") {
    cartModal.style.display = "none";
  } else {
    cartModal.style.display = "flex";
    renderCartItems();
  }
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p class='empty-msg'>Tu carrito está vacío.</p>";
    document.getElementById("cart-total").innerText = "S/.0.00";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price;
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

  document.getElementById("cart-total").innerText = "S/." + total.toFixed(2);
}

function updateCartUI() {
  const countElement = document.getElementById("cart-count");
  if (countElement) countElement.innerText = cart.length;
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCartItems();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCartItems();
  updateCartUI();
}

function sendToWhatsapp() {
  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  let message = "Hola FungusLlampa, quiero realizar el siguiente pedido:%0A%0A";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    message += `${index + 1}. *${item.name}* - ${item.variety} (S/.${
      item.price
    })%0A`;
  });
  message += `%0A*TOTAL: S/.${total.toFixed(2)}*%0A%0A`;
  message += "¿Cuál es el método de pago?";
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
