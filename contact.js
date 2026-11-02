// ===== Contact form: validation and email compilation =====

// Change this one line to change who receives the email
const RECIPIENT = "info@veemoobites.co.za";

const form = document.getElementById("contactForm");
const preview = document.getElementById("emailPreview");
const messageBox = document.getElementById("cmessage");
const counter = document.getElementById("messageCount");

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

// One validator per field. Each returns true (valid) or false (invalid).
const validators = {
    cname: function () {
        const value = document.getElementById("cname").value.trim();
        if (value.length < 2) {
            showError("cname", "Please enter your name (at least 2 characters).");
            return false;
        }
        if (!/^[A-Za-z\u00C0-\u024F' -]+$/.test(value)) {
            showError("cname", "Names can only contain letters, spaces, hyphens and apostrophes.");
            return false;
        }
        clearError("cname");
        return true;
    },

    cemail: function () {
        const value = document.getElementById("cemail").value.trim();
        if (value === "") {
            showError("cemail", "Please enter your email address.");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError("cemail", "Enter a valid email address, e.g. name@example.com.");
            return false;
        }
        clearError("cemail");
        return true;
    },

    cphone: function () {
        const value = document.getElementById("cphone").value.replace(/[\s-]/g, "");
        // Phone is optional, but must be valid if filled in
        if (value !== "" && !/^(\+27|0)\d{9}$/.test(value)) {
            showError("cphone", "Enter a valid South African number, e.g. 072 458 4640.");
            return false;
        }
        clearError("cphone");
        return true;
    },

    ctype: function () {
        if (document.getElementById("ctype").value === "") {
            showError("ctype", "Please choose the type of message.");
            return false;
        }
        clearError("ctype");
        return true;
    },

    cmessage: function () {
        const value = messageBox.value.trim();
        if (value.length < 10) {
            showError("cmessage", "Please write a message of at least 10 characters.");
            return false;
        }
        if (value.length > 1000) {
            showError("cmessage", "Please keep your message under 1000 characters.");
            return false;
        }
        clearError("cmessage");
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

// Live character counter
messageBox.addEventListener("input", function () {
    counter.textContent = messageBox.value.length + " / 1000 characters";
});

// Build the email text from the form values
function buildEmail() {
    const name = document.getElementById("cname").value.trim();
    const email = document.getElementById("cemail").value.trim();
    const phone = document.getElementById("cphone").value.trim() || "Not provided";
    const type = document.getElementById("ctype").value;
    const message = messageBox.value.trim();

    const subject = "[" + type + "] Message from " + name;
    const body =
        "Hi VeeMoo Bites,\r\n\r\n" +
        message + "\r\n\r\n" +
        "---\r\n" +
        "Name: " + name + "\r\n" +
        "Email: " + email + "\r\n" +
        "Phone: " + phone + "\r\n" +
        "Message type: " + type;

    return { subject: subject, body: body };
}

// Show the compiled email with a button to send it
function showPreview() {
    const email = buildEmail();
    const mailto = "mailto:" + RECIPIENT +
        "?subject=" + encodeURIComponent(email.subject) +
        "&body=" + encodeURIComponent(email.body);

    preview.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Your email is ready to send";

    const to = document.createElement("p");
    to.textContent = "To: " + RECIPIENT;

    const subject = document.createElement("p");
    subject.textContent = "Subject: " + email.subject;

    const body = document.createElement("pre");
    body.textContent = email.body;

    const note = document.createElement("p");
    note.textContent = "Click Send Email to open it in your email app. If nothing opens, use Copy Email Text and paste it into your email.";

    const sendLink = document.createElement("a");
    sendLink.href = mailto;
    sendLink.className = "form-button";
    sendLink.textContent = "Send Email";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "form-button form-button-secondary";
    copyButton.textContent = "Copy Email Text";
    copyButton.addEventListener("click", function () {
        const text = "To: " + RECIPIENT + "\r\nSubject: " + email.subject + "\r\n\r\n" + email.body;
        navigator.clipboard.writeText(text).then(
            function () { copyButton.textContent = "Copied!"; },
            function () { copyButton.textContent = "Copy failed - select the text above instead"; }
        );
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "form-button form-button-secondary";
    editButton.textContent = "Edit Message";
    editButton.addEventListener("click", function () {
        preview.hidden = true;
        document.getElementById("cname").focus();
    });

    const actions = document.createElement("div");
    actions.className = "preview-actions";
    actions.appendChild(sendLink);
    actions.appendChild(copyButton);
    actions.appendChild(editButton);

    preview.appendChild(heading);
    preview.appendChild(to);
    preview.appendChild(subject);
    preview.appendChild(body);
    preview.appendChild(note);
    preview.appendChild(actions);

    preview.hidden = false;
    preview.scrollIntoView({ behavior: "smooth", block: "start" });
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
        preview.hidden = true;
        firstInvalid.focus();
        return;
    }

    showPreview();
});