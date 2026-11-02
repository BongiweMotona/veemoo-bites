// ===== Enquiry form: validation and response =====

// Product prices in Rand
const PRODUCTS = {
    student:   { name: "Student Value Hamper", price: 375 },
    budget2:   { name: "Budget For 2 Hamper", price: 750 },
    pork:      { name: "Pork Hamper", price: 650 },
    halfmonth: { name: "Half Month Hamper", price: 850 },
    valuepack: { name: "Value Pack Hamper", price: 1000 },
    biltong1:  { name: "Biltong Pack (Flavour 1)", price: 40 },
    biltong2:  { name: "Biltong Pack (Flavour 2)", price: 35 }
};

const form = document.getElementById("enquiryForm");
const responseBox = document.getElementById("enquiryResponse");
const addressGroup = document.getElementById("addressGroup");
const dateInput = document.getElementById("deliverydate");

// Format a date as YYYY-MM-DD using the local time zone
function toLocalDateString(d) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

// Earliest selectable date is today
dateInput.min = toLocalDateString(new Date());

function showError(id, message) {
    const field = document.getElementById(id);
    document.getElementById(id + "Error").textContent = message;
    field.classList.add("input-invalid");
    field.setAttribute("aria-invalid", "true");
}

function clearError(id) {
    const field = document.getElementById(id);
    document.getElementById(id + "Error").textContent = "";
    field.classList.remove("input-invalid");
    field.removeAttribute("aria-invalid");
}

function isDelivery() {
    return document.getElementById("methodDelivery").checked;
}

// One validator per field. Each returns true (valid) or false (invalid).
const validators = {
    fullname: function () {
        const value = document.getElementById("fullname").value.trim();
        if (value.length < 2) {
            showError("fullname", "Please enter your full name (at least 2 characters).");
            return false;
        }
        if (!/^[A-Za-z\u00C0-\u024F' -]+$/.test(value)) {
            showError("fullname", "Names can only contain letters, spaces, hyphens and apostrophes.");
            return false;
        }
        clearError("fullname");
        return true;
    },

    phone: function () {
        const value = document.getElementById("phone").value.replace(/[\s-]/g, "");
        if (value === "") {
            showError("phone", "Please enter your phone number.");
            return false;
        }
        if (!/^(\+27|0)\d{9}$/.test(value)) {
            showError("phone", "Enter a valid South African number, e.g. 072 458 4640.");
            return false;
        }
        clearError("phone");
        return true;
    },

    email: function () {
        const value = document.getElementById("email").value.trim();
        // Email is optional, but must be valid if filled in
        if (value !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError("email", "Enter a valid email address, e.g. name@example.com.");
            return false;
        }
        clearError("email");
        return true;
    },

    product: function () {
        if (document.getElementById("product").value === "") {
            showError("product", "Please choose a hamper or biltong pack.");
            return false;
        }
        clearError("product");
        return true;
    },

    quantity: function () {
        const value = document.getElementById("quantity").value;
        const number = Number(value);
        if (value === "" || !Number.isInteger(number) || number < 1 || number > 20) {
            showError("quantity", "Enter a quantity between 1 and 20.");
            return false;
        }
        clearError("quantity");
        return true;
    },

    address: function () {
        // Only needed when delivery is selected
        if (!isDelivery()) {
            clearError("address");
            return true;
        }
        const value = document.getElementById("address").value.trim();
        if (value.length < 10) {
            showError("address", "Please enter your full Bloemfontein delivery address (street, suburb).");
            return false;
        }
        clearError("address");
        return true;
    },

    deliverydate: function () {
        const value = dateInput.value;
        if (value === "") {
            showError("deliverydate", "Please choose a delivery or collection date.");
            return false;
        }
        if (value < dateInput.min) {
            showError("deliverydate", "Please choose today or a future date.");
            return false;
        }
        clearError("deliverydate");
        return true;
    }
};

// Immediate feedback: validate when leaving a field, and re-check while fixing it
Object.keys(validators).forEach(function (id) {
    const field = document.getElementById(id);
    field.addEventListener("blur", validators[id]);
    field.addEventListener("change", validators[id]);
    field.addEventListener("input", function () {
        if (field.classList.contains("input-invalid")) {
            validators[id]();
        }
    });
});

// Show or hide the address box depending on delivery or collection
function toggleAddress() {
    addressGroup.hidden = !isDelivery();
    if (!isDelivery()) {
        clearError("address");
    }
}

document.getElementById("methodDelivery").addEventListener("change", toggleAddress);
document.getElementById("methodCollection").addEventListener("change", toggleAddress);

// Build the response shown after a valid submission
function showResponse() {
    const firstName = document.getElementById("fullname").value.trim().split(" ")[0];
    const phone = document.getElementById("phone").value.trim();
    const productKey = document.getElementById("product").value;
    const item = PRODUCTS[productKey];
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    const total = item.price * quantity;

    const parts = dateInput.value.split("-");
    const niceDate = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-ZA", {
        day: "numeric", month: "long", year: "numeric"
    });

    responseBox.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Thank you, " + firstName + "!";

    const summary = document.createElement("p");
    summary.textContent = quantity + " x " + item.name + " = R" + total + ".";

    const method = document.createElement("p");
    method.textContent = isDelivery()
        ? "Free delivery to your Bloemfontein address on " + niceDate + "."
        : "Collection at Waterfront Mall on " + niceDate + ".";

    const next = document.createElement("p");
    next.textContent = "We will confirm availability and arrange payment with you on " + phone + " within 24 hours.";

    responseBox.appendChild(heading);
    responseBox.appendChild(summary);
    responseBox.appendChild(method);
    responseBox.appendChild(next);

    if (productKey === "student") {
        const tip = document.createElement("p");
        tip.textContent = "The Student Value Hamper is our most popular, so we recommend confirming early.";
        responseBox.appendChild(tip);
    }

    responseBox.hidden = false;
    responseBox.scrollIntoView({ behavior: "smooth", block: "start" });

    form.reset();
    toggleAddress();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    let firstInvalid = null;

    Object.keys(validators).forEach(function (id) {
        const valid = validators[id]();
        if (!valid && !firstInvalid) {
            firstInvalid = document.getElementById(id);
        }
    });

    if (firstInvalid) {
        responseBox.hidden = true;
        firstInvalid.focus();
        return;
    }

    showResponse();
});