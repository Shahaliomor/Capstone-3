let cartService;

class ShoppingCartService {

    cart = {
        items:[],
        total:0
    };

    addToCart(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        // const headers = userService.getHeaders();

        axios.post(url, {})// ,{headers})
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Add to cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    setCart(data)
    {
        this.cart = {
            items: [],
            total: 0
        }

        this.cart.total = data.total;

        for (const [key, value] of Object.entries(data.items)) {
            this.cart.items.push(value);
        }
    }

    loadCart()
    {

        const url = `${config.baseUrl}/cart`;

        axios.get(url)
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Load cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })

    }

    loadCartPage()
    {
        const main = document.getElementById("main");
        main.innerHTML = "";

        let wrapper = document.createElement("div");
        wrapper.classList.add("cart-page");

        let cartLeft = document.createElement("div");
        cartLeft.classList.add("cart-left");

        let cartHeader = document.createElement("div");
        cartHeader.classList.add("cart-header");

        let h1 = document.createElement("h1");
        h1.innerText = "Shopping Cart";
        cartHeader.appendChild(h1);

        let clearButton = document.createElement("button");
        clearButton.classList.add("btn", "btn-danger");
        clearButton.innerText = "Clear Cart";
        clearButton.addEventListener("click", () => this.clearCart());
        cartHeader.appendChild(clearButton);

        cartLeft.appendChild(cartHeader);

        this.cart.items.forEach(item => {
            this.buildItem(item, cartLeft);
        });

        let cartRight = document.createElement("div");
        cartRight.classList.add("cart-summary");

        let subtotal = document.createElement("h3");
        subtotal.innerText = `Subtotal (${this.cart.items.length} item${this.cart.items.length !== 1 ? "s" : ""}): $${this.cart.total.toFixed(2)}`;
        cartRight.appendChild(subtotal);

        let checkoutButton = document.createElement("button");
        checkoutButton.classList.add("checkout-btn");
        checkoutButton.innerText = "Proceed to Checkout";
        checkoutButton.addEventListener("click", () => this.checkout());
        cartRight.appendChild(checkoutButton);

        wrapper.appendChild(cartLeft);
        wrapper.appendChild(cartRight);
        main.appendChild(wrapper);
    }

    buildItem(item, parent)
    {
        let outerDiv = document.createElement("div");
        outerDiv.classList.add("amazon-cart-item");

        let img = document.createElement("img");
        img.src = `./images/products/${item.product.imageUrl}`;
        img.alt = item.product.name;
        img.classList.add("cart-product-img");

        let infoDiv = document.createElement("div");
        infoDiv.classList.add("cart-product-info");

        let name = document.createElement("h4");
        name.innerText = item.product.name;
        infoDiv.appendChild(name);

        let stock = document.createElement("p");
        stock.innerText = "In Stock";
        stock.classList.add("in-stock");
        infoDiv.appendChild(stock);

        let description = document.createElement("p");
        description.innerText = item.product.description;
        infoDiv.appendChild(description);

        let quantity = document.createElement("p");
        quantity.innerText = `Quantity: ${item.quantity}`;
        infoDiv.appendChild(quantity);

        let price = document.createElement("h4");
        price.innerText = `$${item.product.price}`;
        price.classList.add("cart-price");

        outerDiv.appendChild(img);
        outerDiv.appendChild(infoDiv);
        outerDiv.appendChild(price);

        parent.appendChild(outerDiv);
    }

    clearCart()
    {

        const url = `${config.baseUrl}/cart`;

        axios.delete(url)
             .then(response => {
                 this.cart = {
                     items: [],
                     total: 0
                 }

                 this.cart.total = response.data.total;

                 for (const [key, value] of Object.entries(response.data.items)) {
                     this.cart.items.push(value);
                 }

                 this.updateCartDisplay()
                 this.loadCartPage()

             })
             .catch(error => {

                 const data = {
                     error: "Empty cart failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }

    checkout()
    {
        const confirmed = confirm(
    `🛒 Proceed to Checkout?

    Payment Method:
    Cash on Delivery (COD) only.

    Please confirm your delivery address in your Profile before placing the order.

    Do you want to continue?`
        );

        if(!confirmed)
        {
            return;
        }

        const url = `${config.baseUrl}/orders`;

        axios.post(url, {})
            .then(response => {
                alert(
    `🎉 Order placed successfully!

    Thank you for shopping at Shah's Halal Grocery Store.

    Payment Method:
    Cash on Delivery (COD)

    Please keep cash ready upon delivery.`
                );

                const data = {
                    message: "Order placed successfully!"
                };

                templateBuilder.append("message", data, "errors");

                this.cart = {
                    items: [],
                    total: 0
                };

                this.updateCartDisplay();
                this.loadCartPage();
            })
            .catch(error => {
                const data = {
                    error: "Checkout failed. Please check your cart and address."
                };

                templateBuilder.append("error", data, "errors");
            });
    }

    updateCartDisplay()
    {
        try {
            const itemCount = this.cart.items.length;
            const cartControl = document.getElementById("cart-items")

            cartControl.innerText = itemCount;
        }
        catch (e) {

        }
    }
}





document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if(userService.isLoggedIn())
    {
        cartService.loadCart();
    }

});
