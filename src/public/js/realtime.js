const socket = io();

const productsList = document.getElementById("products-list");

socket.on("updateProducts", (products) => {
  productsList.innerHTML = "";
  if (products.length > 0) {
    products.forEach((product) => {
      const listItem = document.createElement("li");
      listItem.textContent = `ID: ${product.id} | ${product.title} - $${product.price}`;
      productsList.appendChild(listItem);
    });
  } else {
    productsList.innerHTML = "<p>No hay productos para mostrar.</p>";
  }
});

const addForm = document.getElementById("add-product-form");
const deleteForm = document.getElementById("delete-product-form");

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const newProduct = {
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category: formData.get("category"),
  };
  socket.emit("addProduct", newProduct);
  addForm.reset();
});

deleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const productId = document.querySelector(
    '#delete-product-form input[name="id"]'
  ).value;
  socket.emit("deleteProduct", productId);
  deleteForm.reset();
});
