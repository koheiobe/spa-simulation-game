import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
const serviceAccount = require('../key/admin.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://spa-simulation-game.firebaseio.com'
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

// The Firebase Admin SDK to access the Firebase Realtime Database.

// export const helloWorld = functions.https.onRequest((request, response) => {
//   response.send('Hello from Firebase!')
// })

// // Take the text parameter passed to this HTTP endpoint and insert it into the
// // Realtime Database under the path /messages/:pushId/original
// export const addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text
//   // Push the new message into the Realtime Database using the Firebase Admin SDK.
//   const snapshot = await admin
//     .database()
//     .ref('/messages')
//     .push({ original })
//   // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//   res.redirect(303, snapshot.ref.toString())
// })

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// export const makeUppercase = functions.database
//   .ref('/messages/{pushId}/original')
//   .onCreate((snapshot, context) => {
//     // Grab the current value of what was written to the Realtime Database.
//     const original = snapshot.val()
//     console.log('Uppercasing', context.params.pushId, original)
//     const uppercase = original.toUpperCase()
//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to the Firebase Realtime Database.
//     // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//     if (snapshot.ref.parent !== null) {
//       return snapshot.ref.parent.child('uppercase').set(uppercase)
//     }
//     return new Promise((resolve) => {
//       resolve(null)
//     })
//   })

// uppercase version of the message to /messages/:pushId/uppercase
export const sampleFirestoreTrigger = functions.firestore
  .document('/battles/{battleID}/{userId}/{characterId}')
  .onCreate((snapshot, context) => {
    const db = admin.firestore()
    const userRef = db.collection('sample').doc('ddd')
    return userRef.set({ sample: 5 })
  })
