<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $message = htmlspecialchars($_POST['message']);
    $honeypot = $_POST['honeypot']; // Honeypot field

    // Honeypot check
    if (!empty($honeypot)) {
        http_response_code(400);
        echo "Spam detected.";
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Invalid email format.";
        exit;
    }

    $to = "info@drawdesign.studio";
    $subject = "Website Contact Form: $name";
    $body = "You have received a new message from your website contact form.\n\n"."Here are the details:\n\nName: $name\n\nEmail: $email\n\nPhone: $phone\n\nMessage:\n$message";
    $headers = "From: noreply@yourdomain.com\n";
    $headers .= "Reply-To: $email";

    if (mail($to, $subject, $body, $headers)) {
        http_response_code(200);
        echo "Email sent successfully.";
    } else {
        http_response_code(500);
        echo "Failed to send email.";
    }
} else {
    http_response_code(403);
    echo "Forbidden";
}
?>
