let adminService;

class AdminService
{
    loadDashboard()
    {
        const main = document.getElementById("main");
        main.innerHTML = "";

        const dashboard = document.createElement("div");
        dashboard.classList.add("admin-dashboard");

        dashboard.innerHTML = `
            <h1>📊 Admin Dashboard</h1>

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
}

document.addEventListener("DOMContentLoaded", () => {
    adminService = new AdminService();
});