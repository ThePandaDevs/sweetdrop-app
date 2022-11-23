import { API_URI, HEADERS_URI } from "./API.js";
import { getUser } from "../utils/LocalStorage.js";
import NotifyService from "../utils/NotifyService.js";

const name = document.getElementById("name");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const openAddress = document.querySelector("#openAddress");
const cardProducts = document.querySelector("#products");
const received_by = document.querySelector("#received_by");
const isTheOwner = document.querySelector("#isTheOwner");
const comment = document.querySelector("#comment");
const formOrder = document.querySelector("#formOrder");
const container = document.querySelector("#container");

const getUrl = new URLSearchParams(window.location.search);
let id = getUrl.get("id");
const user = getUser();

let productsArray = [];

let images = [
  "https://cdn.sstatic.net/Img/teams/teams-illo-free-sidebar-promo.svg",
];

getInfoStore();
getProducts();

formOrder.addEventListener("submit", saveOrder);

function getInfoStore() {
  NotifyService.loadingNotification();
  fetch(API_URI + `/stores/${id}`, {
    method: "GET",
    headers: HEADERS_URI,
  })
    .then((response) => response.json())
    .then((data) => {
      NotifyService.loadingNotificationRemove();

      isTheOwner.addEventListener("change", (event) => {
        if (isTheOwner.checked) {
          received_by.value = data.data.owner;
        } else {
          received_by.value = "";
        }
      });
      name.innerHTML = `<p class="fw-bold fs-5 text-auxiliar">${data.data.name}</p>`;
      phone.innerHTML = `<i class="fas fa-phone me-2 "></i>${data.data.phone}</span>`;
      address.innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${
        data.data.address + " CP " + data.data.zipcode
      }</span>`;
      openAddress.innerHTML = `<a href="http://maps.google.com/?q=${
        data.data.address + " " + data.data.zipcode
      }" target="_blank" class="btn btn-outline-primary font-bold">Abrir en Google Maps</a>`;
    })
    .catch((err) => {
      NotifyService.loadingNotificationRemove();
      NotifyService.notificatonError(
        "Ha ocurrido un error al cargar los datos"
      );
    });
}

function getProducts() {
  NotifyService.loadingNotification();
  fetch(API_URI + `/products`, {
    method: "GET",
    headers: HEADERS_URI,
  })
    .then((response) => response.json())
    .then((products) => {
      NotifyService.loadingNotificationRemove();
      if (products.data.length === 0) {
        cardProducts.innerHTML = `<div class="card m-0 py-5 bg-light  text-primary text-center">No tienes productos registrados</div>`;
      } else {
        render(products);
      }
    })
    .catch((err) => {
      NotifyService.loadingNotificationRemove();
      NotifyService.notificatonError(
        "Ha ocurrido un error al cargar los productos."
      );
    });
}

function render(products) {
  products.data.forEach((product) => {
    let cardOutside = document.createElement("div");
    cardOutside.classList.add("col-xl-6", "col-lg-6", "col-md-6");

    let cardContainer = document.createElement("div");
    cardContainer.classList.add("card", "mb-3", "bg-light");

    let cardRow = document.createElement("div");
    cardRow.classList.add("row", "g-0");

    let cardImage = document.createElement("div");
    cardImage.classList.add(
      "col-md-4",
      "d-flex",
      "align-items-center",
      "justify-content-center",
      "pt-4",
      "pb-1"
    );

    let image = document.createElement("img");
    image.classList.add(
      "card-img",
      "card-img-left",
      "img-fluid",
      "w-75",
      "h-auto",
      "product-image"
    );
    image.src = product.image;

    let cardInfoContainer = document.createElement("div");
    cardInfoContainer.classList.add("col-md-8");

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    let textTitle = document.createElement("h5");
    textTitle.classList.add("card-title", "mb-0");
    textTitle.innerHTML = product.name;

    let textSku = document.createElement("small");
    textSku.innerHTML = product.sku;

    let textPrice = document.createElement("p");
    textPrice.classList.add("card-text", "text-auxiliar", "font-extrabold");
    textPrice.innerHTML = "$" + product.price + " MXN";

    let labelQuantity = document.createElement("label");
    labelQuantity.classList.add("font-bold");
    labelQuantity.innerHTML = "Cantidad";
    labelQuantity.setAttribute("for", product.id);

    let quantityContainer = document.createElement("div");
    quantityContainer.classList.add("input-group", "mb-3");

    let inputQuantity = document.createElement("input");
    inputQuantity.classList.add("form-control", "h-auto", "d-inline-block", "text-center");
    inputQuantity.setAttribute("type", "number");
    inputQuantity.setAttribute("min", "0");
    inputQuantity.setAttribute("value", "0");
    inputQuantity.dataset.id = product.id;
    inputQuantity.dataset.quantity = 0;

    let btnMinus = document.createElement("button");
    btnMinus.classList.add(
      "btn",
      "btn-secondary",
      "input-group-text",
      "btn-lg"
    );
    btnMinus.innerHTML = "-";
    btnMinus.setAttribute("type", "button");
    btnMinus.addEventListener("click", () => minusProduct(inputQuantity));

    let btnPlus = document.createElement("button");
    btnPlus.classList.add("btn", "btn-secondary", "input-group-text", "btn-lg");
    btnPlus.innerHTML = "+";
    btnPlus.setAttribute("type", "button");
    btnPlus.addEventListener("click", () => plusProduct(inputQuantity));

    let addBtnContainer = document.createElement("div");
    addBtnContainer.classList.add("d-flex", "justify-content-center", "mt-5");

    let addBtn = document.createElement("button");
    addBtn.classList.add("btn", "btn-auxiliar", "col-12", "mt-2");
    addBtn.innerHTML = "Agregar";
    btnPlus.setAttribute("type", "button");
    addBtn.addEventListener("click", (event) =>
      addProduct(event, product.id)
    );

    cardImage.appendChild(image);

    addBtnContainer.appendChild(addBtn);

    quantityContainer.appendChild(btnMinus);
    quantityContainer.appendChild(inputQuantity);
    quantityContainer.appendChild(btnPlus);

    cardBody.appendChild(textTitle);
    cardBody.appendChild(textSku);
    cardBody.appendChild(textPrice);
    cardBody.appendChild(labelQuantity);
    cardBody.appendChild(quantityContainer);
    cardBody.appendChild(addBtnContainer);

    cardInfoContainer.appendChild(cardBody);

    cardRow.appendChild(cardImage);
    cardRow.appendChild(cardInfoContainer);

    cardContainer.appendChild(cardRow);

    cardOutside.appendChild(cardContainer);

    cardProducts.appendChild(cardOutside);
  });
}

function minusProduct(input) {
  if (input.dataset.quantity > 0) {
    input.dataset.quantity = parseInt(input.dataset.quantity) - 1;
    input.value = input.dataset.quantity;
  } else {
    input.dataset.quantity = 0;
    input.value = 0;    
  }
}

function plusProduct(input) {
  input.dataset.quantity = parseInt(input.dataset.quantity) + 1;
  input.value = input.dataset.quantity;
}

function addProduct(event, productId) {
  let products = document.querySelectorAll(".form-control");
  products.forEach((product) => {
    if (product.dataset.id == productId) {
      if (product.dataset.quantity > 0) {
        productsArray.push({
          id: productId,
          quantity: product.value,
        });
        // do not reload the page
        event.preventDefault();
        NotifyService.notificatonSuccess(
          "Producto agregado satisfactoriamente"
        );

        // print the array in JSON format
        console.log(JSON.stringify(productsArray));
      } else {
        event.preventDefault();
        NotifyService.notificatonError("Por favor, agrega al menos 1 producto");
      }
    }
  });
}

function confirmDeleteOrder(id) {
  NotifyService.notificationConfirm(deleteOrder(id));
}

function deleteOrder(id) {
  NotifyService.loadingNotification();
  fetch(API_URI + `/orders/${id}`, {
    method: "DELETE",
    headers: HEADERS_URI,
  })
    .then((response) => response.json())
    .then((data) => {
      NotifyService.loadingNotificationRemove();
      NotifyService.notificatonSuccess("Orden eliminada");
      setTimeout(() => {
        window.location.href = "./orders.html";
      }, 2000);
    })
    .catch((err) => {
      NotifyService.loadingNotificationRemove();
      NotifyService.notificatonError(
        "Ha ocurrido un error al eliminar la orden"
      );
    });
}

function createOrder() {
  NotifyService.loadingNotification();
  fetch(API_URI + `/orders`, {
    method: "POST",
    headers: HEADERS_URI,
    body: JSON.stringify({
      store_id: id,
      received_by: received_by.value,
      products: productsArray,
      comment: comment.value,
      images: images,
    }),
  })
    .then((response) => response.json())
    .then((order) => {
      console.log(order);
      if (order.success) {
        NotifyService.loadingNotificationRemove();
        NotifyService.notificatonSuccess(
          "Orden registrada correctamente con el folio " + order.data.folio
        );
        NotifyService.notificatonSuccess(
          "Redireccionando a la lista de ordenes"
        );
        setTimeout(() => {
          window.location.href = "../../../views/orders/orders.html?id=" + id;
        }, 3000);
      } else {
        NotifyService.loadingNotificationRemove();
        NotifyService.notificatonError(
          "La orden no fue registrada, favor de revisar campos."
        );
      }
    })
    .catch((err) => {
      NotifyService.loadingNotificationRemove();
      NotifyService.notificatonError(
        "Ha ocurrido un error al registrar la orden"
      );
    });
}

function validateForm() {
  return (
    comment.value !== "" &&
    received_by.value !== "" &&
    images.length !== 0 &&
    products.length !== 0
  );
}

function saveOrder(e) {
  e.preventDefault();
  if (validateForm()) createOrder();
  else NotifyService.notificatonError("Los campos no deben estar vacios");
}