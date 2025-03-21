const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setUserAsAdmin = functions.https.onCall(async (data, context) => {
  // Only allow requests from authenticated users
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can set roles."
    );
  }

  const { uid } = data;

  try {
    // Set custom claim in Firebase Authentication
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Update Firestore user role
    await admin.firestore().collection("users").doc(uid).update({
      role: "admin",
      updatedAt: new Date().toISOString(),
    });

    return { message: `User ${uid} is now an admin.` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
