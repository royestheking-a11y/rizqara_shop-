# Premium E-commerce Platform - Rizqara Shop

A high-end, feature-rich e-commerce platform designed for a seamless shopping experience. Built with a modern tech stack, it offers robust features for both customers and administrators.

**Live Website:** [https://rizqarashop.vercel.app/](https://rizqarashop.vercel.app/)

## 🚀 Key Features

### User Experience
*   **Immersive Shopping:** Browse products with advanced filtering, sorting, and detailed product views.
*   **Visual Search:** Find products using images for a more intuitive search experience.
*   **Gift Generator:** AI-powered tool to help users find the perfect gift based on recipient preferences.
*   **Custom Requests:**
    *   **Custom Craft:** Request personalized craft items.
    *   **Custom Sketch:** Order custom sketches by uploading references.
*   **User Account:** Manage orders, wishlist, profile settings, and view order history.
*   **Interactive Cart & Checkout:** Smooth add-to-cart animations, secure checkout process, and order confirmation.
*   **Reviews & Ratings:** Leave feedback on products to help others make informed decisions.
*   **Offers & Vouchers:** Browse special offers and apply discount vouchers.

### Admin Dashboard
*   **Comprehensive Dashboard:** Real-time overview of sales, orders, and user activity.
*   **Product Management:** Add, edit, and delete products with image support (Cloudinary).
*   **Order Management:** Track and manage customer orders, including status updates (Pending, Processing, Shipped, Delivered).
*   **Custom Request Management:** Review and manage Custom Craft and Custom Sketch requests.
*   **Customer Management:** View customer details and order history.
*   **Content Management:**
    *   **Carousel:** Manage homepage carousel images.
    *   **Messages:** View and reply to contact form messages.
    *   **Reviews:** Moderation of user reviews.
*   **Financials:** Track payments and manage refunds.
*   **Vouchers:** Create and manage discount codes.

## 🛠️ Tech Stack

**Frontend:**
*   **React:** UI library for building the interface.
*   **Vite:** Fast build tool and development server.
*   **TailwindCSS:** Utility-first CSS framework for styling.
*   **Framer Motion:** For smooth animations and transitions.
*   **Radix UI:** Headless UI primitives for accessible components (Dialogs, Dropdowns, etc.).
*   **Redux / Context API:** State management.

**Backend:**
*   **Node.js & Express:** Server-side runtime and framework.
*   **MongoDB & Mongoose:** NoSQL database and object modeling.
*   **Socket.io:** Real-time updates for notifications and order status.
*   **Cloudinary:** Cloud storage for image uploads.
*   **JWT:** Secure user authentication.

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install Dependencies:**
    *   **Frontend:**
        ```bash
        npm install
        ```
    *   **Backend:**
        ```bash
        cd server
        npm install
        ```

3.  **Environment Configuration:**
    *   Create a `.env` file in the root and `server` directories.
    *   Add necessary variables (MongoDB URI, Cloudinary keys, JWT Secret, etc.).

4.  **Run Locally:**
    *   **Backend:**
        ```bash
        cd server
        npm start
        ```
    *   **Frontend:**
        ```bash
        npm run dev
        ```

## 📜 License
This project is proprietary and intended for Rizqara Shop.