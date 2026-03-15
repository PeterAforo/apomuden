import webpush from "web-push";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
let vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@apomuden.gov.gh";

// Ensure vapidSubject is a valid mailto: URL
if (vapidSubject && !vapidSubject.startsWith("mailto:")) {
  vapidSubject = `mailto:${vapidSubject}`;
}

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export default webpush;
