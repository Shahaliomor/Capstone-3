let adminService;

class AdminService
{
    products = [];

    loadDashboard()
    {
        const main = document.getElementById("main");
        main.innerHTML = "";

        const dashboard = document.createElement("div");
        dashboard.classList.add("admin-dashboard");

        dashboard.innerHTML = `
            <h1>📊 Admin Dashboard</h1>

            <button class="admin-main-btn" onclick="adminService.loadProductManagement()">
                🛒 Manage Products
            </button>

            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <h3>Total Products</h3>
                    <p id="total-products">0</p>
                </div>

                <div class="dashboard-card">
                    <h3>Total Categories</h3>
                    <p id="total-categories">0</p>
                </div>

                <div class="dashboard-card">
                    <h3>Total Orders</h3>
                    <p id="total-orders">0</p>
                </div>

                <div class="dashboard-card">
                    <h3>Total Revenue</h3>
                    <p id="total-revenue">$0.00</p>
                </div>
            </div>

            <div class="recent-orders">
                <h2>Recent Orders</h2>
                <div id="recent-orders-list">
                    <p>No recent orders loaded yet.</p>
                </div>
            </div>
        `;

        main.appendChild(dashboard);

        this.loadProductCount();
        this.loadCategoryCount();
        this.loadOrders();
    }

    loadProductCount()
    {
        axios.get(`${config.baseUrl}/products`)
            .then(response => {
                document.getElementById("total-products").innerText = response.data.length;
            })
            .catch(error => {
                document.getElementById("total-products").innerText = "Error";
            });
    }

    loadCategoryCount()
    {
        axios.get(`${config.baseUrl}/categories`)
            .then(response => {
                document.getElementById("total-categories").innerText = response.data.length;
            })
            .catch(error => {
                document.getElementById("total-categories").innerText = "Error";
            });
    }

    loadOrders()
    {
        axios.get(`${config.baseUrl}/orders`)
            .then(response => {
                const orders = response.data;

                document.getElementById("total-orders").innerText = orders.length;

                let totalRevenue = 0;

                orders.forEach(order => {
                    if(order.shippingAmount)
                    {
                        totalRevenue += Number(order.shippingAmount);
                    }
                });

                document.getElementById("total-revenue").innerText = `$${totalRevenue.toFixed(2)}`;

                this.displayRecentOrders(orders);
            })
            .catch(error => {
                document.getElementById("total-orders").innerText = "N/A";
                document.getElementById("total-revenue").innerText = "N/A";
                document.getElementById("recent-orders-list").innerHTML =
                    "<p>Your backend may not have GET /orders yet.</p>";
            });
    }

    displayRecentOrders(orders)
    {
        const list = document.getElementById("recent-orders-list");
        list.innerHTML = "";

        if(!orders || orders.length === 0)
        {
            list.innerHTML = "<p>No recent orders found.</p>";
            return;
        }

        orders.slice().reverse().slice(0, 5).forEach(order => {
            const div = document.createElement("div");
            div.classList.add("recent-order-card");

            div.innerHTML = `
                <strong>Order #${order.orderId || order.id}</strong>
                <span>Total: $${order.shippingAmount ? Number(order.shippingAmount).toFixed(2) : "0.00"}</span>
            `;

            list.appendChild(div);
        });
    }

    loadProductManagement()
    {
        const main = document.getElementById("main");
        main.innerHTML = "";

        const page = document.createElement("div");
        page.classList.add("admin-products-page");

        page.innerHTML = `
            <div class="admin-products-header">
                <h1>🛒 Product Management</h1>
                <button class="admin-main-btn" onclick="adminService.showProductForm()">➕ Add Product</button>
            </div>

            <div class="admin-product-tools">
                <input type="text" id="admin-product-search" placeholder="Search products..." onkeyup="adminService.searchProducts()">
                <button onclick="adminService.loadDashboard()">Back to Dashboard</button>
            </div>

            <div id="admin-products-table"></div>
        `;

        main.appendChild(page);

        this.loadProducts();
    }

    loadProducts()
    {
        axios.get(`${config.baseUrl}/products`)
            .then(response => {
                this.products = response.data;
                this.displayProducts(this.products);
            })
            .catch(error => {
                templateBuilder.append("error", {error: "Loading products failed."}, "errors");
            });
    }

    displayProducts(products)
    {
        const tableDiv = document.getElementById("admin-products-table");

        if(!products || products.length === 0)
        {
            tableDiv.innerHTML = "<p>No products found.</p>";
            return;
        }

        let html = `
            <table class="admin-products-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Image File</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach((product, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="./images/products/${product.imageUrl}" alt="${product.name}"></td>
                    <td>${product.name}</td>
                    <td>$${Number(product.price).toFixed(2)}</td>
                    <td>${product.categoryId}</td>
                    <td>${product.stock}</td>
                    <td>${product.imageUrl}</td>
                    <td>
                        <button class="edit-btn" onclick="adminService.showProductForm(${product.productId})">Edit</button>
                        <button class="delete-btn" onclick="adminService.deleteProduct(${product.productId})">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        tableDiv.innerHTML = html;
    }

    searchProducts()
    {
        const keyword = document.getElementById("admin-product-search").value.toLowerCase();

        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.imageUrl.toLowerCase().includes(keyword)
        );

        this.displayProducts(filtered);
    }

    showProductForm(productId = null)
    {
        let product = {
            productId: "",
            name: "",
            price: "",
            categoryId: "",
            description: "",
            subCategory: "",
            stock: "",
            featured: false,
            imageUrl: "no-image.jpg"
        };

        if(productId)
        {
            product = this.products.find(p => p.productId === productId);
        }

        const form = document.createElement("div");
        form.classList.add("admin-modal");

        form.innerHTML = `
            <div class="admin-form">
                <h2>${productId ? "Edit Product" : "Add Product"}</h2>

                <label>Name</label>
                <input type="text" id="product-name" value="${product.name}">

                <label>Price</label>
                <input type="number" step="0.01" id="product-price" value="${product.price}">

                <label>Category ID</label>
                <input type="number" id="product-category" value="${product.categoryId}">

                <label>Description</label>
                <textarea id="product-description">${product.description}</textarea>

                <label>Sub Category</label>
                <input type="text" id="product-subcategory" value="${product.subCategory || ""}">

                <label>Stock</label>
                <input type="number" id="product-stock" value="${product.stock}">

                <label>Image Filename</label>
                <input type="text" id="product-image" value="${product.imageUrl}">

                <label>
                    <input type="checkbox" id="product-featured" ${product.featured ? "checked" : ""}>
                    Featured
                </label>

                <div class="admin-form-buttons">
                    <button class="admin-save-btn" onclick="adminService.saveProduct(${productId})">Save</button>
                    <button class="admin-cancel-btn" onclick="adminService.closeProductForm()">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(form);
    }

    closeProductForm()
    {
        const modal = document.querySelector(".admin-modal");
        if(modal)
        {
            modal.remove();
        }
    }

    saveProduct(productId)
    {
        const product = {
            name: document.getElementById("product-name").value,
            price: Number(document.getElementById("product-price").value),
            categoryId: Number(document.getElementById("product-category").value),
            description: document.getElementById("product-description").value,
            subCategory: document.getElementById("product-subcategory").value,
            stock: Number(document.getElementById("product-stock").value),
            imageUrl: document.getElementById("product-image").value,
            featured: document.getElementById("product-featured").checked
        };

        if(productId)
        {
            axios.put(`${config.baseUrl}/products/${productId}`, product)
                .then(response => {
                    this.closeProductForm();
                    this.loadProducts();
                    templateBuilder.append("message", {message: "Product updated successfully."}, "errors");
                })
                .catch(error => {
                    templateBuilder.append("error", {error: "Product update failed."}, "errors");
                });
        }
        else
        {
            axios.post(`${config.baseUrl}/products`, product)
                .then(response => {
                    this.closeProductForm();
                    this.loadProducts();
                    templateBuilder.append("message", {message: "Product added successfully."}, "errors");
                })
                .catch(error => {
                    templateBuilder.append("error", {error: "Product add failed."}, "errors");
                });
        }
    }

    deleteProduct(productId)
    {
        if(!confirm("Are you sure you want to delete this product?"))
        {
            return;
        }

        axios.delete(`${config.baseUrl}/products/${productId}`)
            .then(response => {
                this.loadProducts();
                templateBuilder.append("message", {message: "Product deleted successfully."}, "errors");
            })
            .catch(error => {
                console.log(error);

                templateBuilder.append("error", {
                    error: "Product delete failed. This product may already be used in a cart or order."
                }, "errors");
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    adminService = new AdminService();
});