// --- CONFIGURACIÓN ---
const phoneNumber = "51966756553";

// --- IMÁGENES GENÉRICAS DE INSUMOS ---
const INSUMO_IMAGES = {
  kit: [
    "https://i.ibb.co/fGD0K6PC/Kit-de-Cultivo-I.jpg",
    "https://i.ibb.co/TD0GNn6G/Kit-de-cultivo-II.jpg",
    "https://i.ibb.co/CsmYddXb/Kit-de-cultivo-III.jpg",
  ],
  spawn: [
    "https://i.ibb.co/HfTv3rd9/Grain-spawn-I.jpg",
    "https://i.ibb.co/fG8JVRdj/Grain-Spawn-II.jpg",
    "https://i.ibb.co/Sw59MbCZ/Grain-Spawn-III.jpg",
  ],
  agar: [
    "https://i.ibb.co/JWX4s9Gs/Placas-Petri-I.jpg",
    "https://i.ibb.co/nskZ8Hzp/Placas-Petri-II.jpg",
    "https://i.ibb.co/rKJG8LPK/Placas-Petri-III.jpg",
  ],
};

// --- DATOS DE VARIANTES ---
const productVariants = {
  dosis: {
    options: [
      "Elección del Chef (Sorpréndeme)",
      "Elegir Variedad (Consultar Stock)",
    ],
    details: {
      "Elección del Chef (Sorpréndeme)": {
        priceMod: 0,
        text: "Nosotros seleccionamos las mejores cepas disponibles para tu experiencia. Opción recomendada.",
      },
      "Elegir Variedad (Consultar Stock)": {
        priceMod: 0,
        text: "Agrega este ítem al carrito. Al enviarnos el pedido por WhatsApp, te indicaremos qué variedades específicas tenemos listas para hoy.",
      },
    },
  },
  chocohongos: {
    options: ["Cepa Clásica", "Cepa Exótica"],
    details: {
      "Cepa Clásica": {
        priceMod: 0,
        text: "La opción ideal para empezar. Genéticas equilibradas como Golden Teacher o B+.",
      },
      "Cepa Exótica": {
        priceMod: 15,
        text: "Para psiconautas que buscan intensidad. Genéticas híbridas o mutaciones.",
      },
    },
  },
  cepas: {
    options: [
      "Cultura Líquida (LC)",
      "Grano (Spawn)",
      "Kit de Cultivo",
      "Placa Petri (Agar)",
    ],
    details: {
      "Cultura Líquida (LC)": {
        fixedPrice: 70,
        text: "Jeringa de 10ml con micelio vivo de esta genética específica. Ideal para inocular tus propios frascos.",
        imageType: "strain",
      },
      "Grano (Spawn)": {
        fixedPrice: 90,
        text: "Bolsa de 1kg de grano esterilizado 100% colonizado con esta genética. Listo para mezclar con sustrato.",
        imageType: "spawn",
      },
      "Kit de Cultivo": {
        fixedPrice: 180,
        text: "Sistema todo en uno colonizado con esta genética. Incluye grano, sustrato y caja de fructificación.",
        imageType: "kit",
      },
      "Placa Petri (Agar)": {
        fixedPrice: 35,
        text: "Placa de agar con micelio aislado de esta genética. Perfecta para clonación o expansión (G2G).",
        imageType: "agar",
      },
    },
  },
  default: {
    options: ["Estándar"],
    details: { Estándar: { priceMod: 0, text: "Producto seleccionado." } },
  },
};

// --- VARIABLES GLOBALES ---
let cart = JSON.parse(localStorage.getItem("magikCart")) || [];
let currentProduct = {};
let currentSlideIndex = 0;
let currentImages = [];

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

  // Guardar datos base
  currentProduct = {
    name: element.getAttribute("data-name"),
    basePrice: parseFloat(
      element.getAttribute("data-price").replace("S/.", "")
    ),
    baseDesc: element.getAttribute("data-desc"),
    strainImg: element
      .getAttribute("data-img")
      .split(",")
      .map((img) => img.trim()),
    category: category,
  };

  document.getElementById("modal-title").innerText = currentProduct.name;

  setupVariantSelect(category);
  modal.style.display = "flex";
}

function setupVariantSelect(category) {
  const select = document.getElementById("variant-select");
  const label = document.getElementById("selector-label");
  const selectorsDiv = document.querySelector(".modal-selectors");

  // Asegurarnos de que el selector sea visible
  if (selectorsDiv) selectorsDiv.style.display = "block";

  if (select) {
    select.innerHTML = "";
    let variantKey = productVariants[category] ? category : "default";
    const variantInfo = productVariants[variantKey];

    if (category === "cepas") label.innerText = "Formato:";
    else if (category === "chocohongos") label.innerText = "Genética:";
    else if (category === "dosis")
      label.innerText = "Preferencia:"; // Etiqueta para Dosis
    else label.innerText = "Opción:";

    variantInfo.options.forEach((opt) => {
      const optionElement = document.createElement("option");
      optionElement.value = opt;
      optionElement.innerText = opt;
      select.appendChild(optionElement);
    });

    select.onchange = () => updateModalDetails(category, select.value);
    updateModalDetails(category, select.value);
  } else {
    updateModalDetails(category, null);
  }
}

function updateModalDetails(category, selectedOption) {
  const priceElement = document.getElementById("modal-price");
  const descElement = document.getElementById("modal-desc");

  if (!productVariants[category] || !selectedOption) {
    priceElement.innerText = "S/." + currentProduct.basePrice.toFixed(2);
    descElement.innerHTML = currentProduct.baseDesc;
    currentImages = currentProduct.strainImg;
    setupCarousel();
    return;
  }

  const details = productVariants[category].details[selectedOption];

  if (details) {
    let finalPrice = details.fixedPrice
      ? details.fixedPrice
      : currentProduct.basePrice + (details.priceMod || 0);
    priceElement.innerText = "S/." + finalPrice.toFixed(2);
    currentProduct.currentPrice = finalPrice;

    if (category === "cepas") {
      descElement.innerHTML = `<p><strong>${currentProduct.name} - ${selectedOption}</strong></p><br><p>${details.text}</p><br><p><em>Características de la cepa:</em> ${currentProduct.baseDesc}</p>`;

      if (details.imageType === "strain")
        currentImages = currentProduct.strainImg;
      else if (details.imageType === "kit") currentImages = INSUMO_IMAGES.kit;
      else if (details.imageType === "spawn")
        currentImages = INSUMO_IMAGES.spawn;
      else if (details.imageType === "agar") currentImages = INSUMO_IMAGES.agar;
    } else {
      // Comportamiento para Dosis y Chocohongos
      descElement.innerHTML = `<p>${currentProduct.baseDesc}</p><br><p style="color: #d4af37;">➤ ${details.text}</p>`;
      currentImages = currentProduct.strainImg;
    }

    currentSlideIndex = 0;
    setupCarousel();
  }
}

// --- LÓGICA DEL CARRUSEL ---
function setupCarousel() {
  const imgWrapper = document.querySelector(".modal-img-wrapper");
  imgWrapper.innerHTML = "";

  if (currentImages.length === 1) {
    imgWrapper.innerHTML = `<img src="${currentImages[0]}" alt="${currentProduct.name}" class="modal-static-img">`;
  } else {
    let slidesHTML = "";
    currentImages.forEach((img, index) => {
      slidesHTML += `<img src="${img}" class="carousel-slide" style="display: ${
        index === 0 ? "block" : "none"
      }">`;
    });
    slidesHTML += `
      <button class="carousel-btn prev" onclick="moveSlide(-1)">&#10094;</button>
      <button class="carousel-btn next" onclick="moveSlide(1)">&#10095;</button>
    `;
    imgWrapper.innerHTML = slidesHTML;
  }
}

function moveSlide(n) {
  const slides = document.getElementsByClassName("carousel-slide");
  if (!slides.length) return;
  slides[currentSlideIndex].style.display = "none";
  currentSlideIndex += n;
  if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
  if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
  slides[currentSlideIndex].style.display = "block";
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

// --- AÑADIR AL CARRITO (Listener Estándar) ---
const standardBtn = document.querySelector(".add-cart-btn");
if (standardBtn) {
  standardBtn.addEventListener("click", function () {
    const select = document.getElementById("variant-select");
    const selectedVariety = select ? select.value : "Estándar";
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
}

// --- FUNCIONES CARRITO ---
function toggleCart() {
  const cartModal = document.getElementById("cartModal");
  cartModal.style.display =
    cartModal.style.display === "flex" ? "none" : "flex";
  if (cartModal.style.display === "flex") renderCartItems();
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
      <div class="item-info"><h4>${item.name}</h4><span>${
      item.variety
    }</span><div><strong>S/.${item.price.toFixed(2)}</strong></div></div>
      <span class="remove-item" onclick="removeFromCart(${item.id})">🗑️</span>`;
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
  if (cart.length === 0) return alert("El carrito está vacío.");
  let message = "Hola FungusLlampa, mi pedido:%0A%0A";
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price;
    message += `${i + 1}. *${item.name}* - ${item.variety} (S/.${
      item.price
    })%0A`;
  });
  message += `%0A*TOTAL: S/.${total.toFixed(2)}*%0A%0AMétodo de pago?`;
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
