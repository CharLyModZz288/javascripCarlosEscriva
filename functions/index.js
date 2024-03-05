const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');


admin.initializeApp();

const db = admin.firestore();

 exports.helloWorld = onRequest((request, response) => {
   logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });
 exports.insertElement = functions.https.onRequest(async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(400).send('Solo se permiten solicitudes GET');
        }

        const data = req.body;

        const docRef = await db.collection('elementos').add(data);

        const elementoId = docRef.id;

        res.status(200).send(`Elemento con ID ${elementoId} fue insertado correctamente.`);
    } catch (error) {
        console.error('Error al insertar el elemento:', error);
        res.status(500).send('Ocurrió un error al insertar el elemento en la base de datos.');
    }
});
exports.deleteElement = functions.https.onRequest(async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(400).send('Solo se permiten solicitudes GET');
        }

        const elementoId = req.query.elementoId; // Obtenemos el ID del elemento de los parámetros de la URL

        if (!elementoId) {
            return res.status(400).send('Se requiere proporcionar un ID de elemento válido');
        }

        await db.collection('elementos').doc(elementoId).delete();

        res.status(200).send(`El elemento con ID ${elementoId} fue eliminado correctamente.`);
    } catch (error) {
        console.error('Error al eliminar el elemento:', error);
        res.status(500).send('Ocurrió un error al eliminar el elemento de la base de datos.');
    }
});

exports.getAllElements = functions.https.onRequest(async (req, res) => {
    try {
        const querySnapshot = await db.collection('elementos').get();

        const elementos = [];

        querySnapshot.forEach(doc => {
            elementos.push(doc.data());
        });

        res.status(200).json(elementos);
    } catch (error) {
        console.error('Error al obtener los elementos:', error);
        res.status(500).send('Ocurrió un error al obtener los elementos de la base de datos.');
    }
});
exports.addTimestampOnCreate = functions.firestore
    .document('elementos/{elementoId}')
    .onCreate((snapshot, context) => {
        const elementoId = context.params.elementoId;

        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        return db.collection('elementos').doc(elementoId).update({ timestamp: timestamp });});