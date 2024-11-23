// // import { initializeApp } from "firebase/app";
// // import { getDatabase } from "firebase/database";

// // const firebaseConfig = {
// //   apiKey: "AIzaSyDulYawgmHPYE23oVw1pxPZ4hCFnwyqiZ4",
// //   authDomain: "heygen-31a72.firebaseapp.com",
// //   projectId: "heygen-31a72",
// //   storageBucket: "heygen-31a72.appspot.com",
// //   messagingSenderId: "456107806192",
// //   appId: "1:456107806192:web:d659a4b772ebc0981ca135",
// //   databaseURL: "https://heygen-31a72-default-rtdb.firebaseio.com/", // Real-time Database URL
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);

// // // Initialize Realtime Database and export
// // const database = getDatabase(app);

// // export { database };

// // lib/database.js
// import clientPromise from "./mongodb";

// export const insertSurvey = async (userName, responses = []) => {
//   const client = await clientPromise;
//   const db = client.db("heygen-surveys");

//   await db.collection("surveys").insertOne({
//     name: userName,
//     responses,
//     createdAt: new Date(),
//   });
// };

// export const addResponse = async (userName, question, answer) => {
//   const client = await clientPromise;
//   const db = client.db("heygen-surveys");

//   await db.collection("surveys").updateOne(
//     { name: userName },
//     { $push: { responses: { question, answer, answeredAt: new Date() } } }
//   );
// };

// export const getSurveyByName = async (userName) => {
//   const client = await clientPromise;
//   const db = client.db("heygen-surveys");

//   return await db.collection("surveys").findOne({ name: userName });
// };

