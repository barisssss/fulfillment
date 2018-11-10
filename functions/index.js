// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment2 = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    function welcome(agent) {
      // let text = new Text();
      // text.setText(
      //   "Willkommen bei cunio! Willst du eine Anfrage oder einen Pinnwandpost erstellen?"
      // );
      // text.setSsml(

      // );
      let conv = agent.conv();
      conv.ask(`<speak>
          <emphasis level="moderate">Hey! Willkommen bei cunio!</emphasis> 
          <break length="600ms" />
          Willst du eine <sub alias="Anfrarghe">Anfrage</sub>, oder einen <sub alias="Pinnwandpohst">Pinnwandpost</sub>erstellen?
        </speak>`);
      agent.add(conv);

      agent.add(
        new Card({
          title: "Willkommen bei cunio!",
          text: "Dein persönlicher Mietassistent",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/cunio-7411b.appspot.com/o/Telephone_cunio%402x.png?alt=media&token=a75d62d8-cebf-4865-9dcd-51424cccca22"
        })
      );

      agent.add(
        new Suggestion({
          title: "Anfrage erstellen"
        })
      );
      agent.add(
        new Suggestion({
          title: "Pinnwandpost erstellen"
        })
      );

      // agent.add(
      //   new Suggestion({
      //     title: "Meine Anfragen ansehen"
      //   })
      // );
      // agent.add(
      //   new Suggestion({
      //     title: "Pinnwandpost erstellen"
      //   })
      // );
      // agent.add(
      //   new Suggestion({
      //     title: "Pinnwand ansehen"
      //   })
      // );
    }

    function fallback(agent) {
      agent.add(`Sorry, das habe ich nicht verstanden.`);
    }

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
  }
);
