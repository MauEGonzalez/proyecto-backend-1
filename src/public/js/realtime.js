const socket = io();

// ----- LÓGICA PARA RECIBIR PRODUCTOS Y ACTUALIZAR LA VISTA -----
const productsList = document.getElementById('products-list');

// Escuchamos el evento 'updateProducts' que envía el servidor
socket.on('updateProducts', (products) => {
    // Limpiamos la lista actual
    productsList.innerHTML = '';

    // Renderizamos cada producto y lo agregamos a la lista
    if (products.length > 0) {
        products.forEach(product => {
            const listItem = document.createElement('li');
            listItem.textContent = `ID: ${product.id} | ${product.title} - $${product.price}`;
            productsList.appendChild(listItem);
        });
    } else {
        productsList.innerHTML = '<p>No hay productos para mostrar.</p>';
    }
});


// ----- LÓGICA PARA ENVIAR PRODUCTOS NUEVOS O ELIMINADOS -----
const addForm = document.getElementById('add-product-form');
const deleteForm = document.getElementById('delete-product-form');

addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const newProduct = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        category: formData.get('category'),
    };
    socket.emit('addProduct', newProduct);
    addForm.reset();
});

deleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = document.querySelector('#delete-product-form input[name="id"]').value;
    socket.emit('deleteProduct', productId);
    deleteForm.reset();
});