"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

const axios = require("axios");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
axios.defaults.baseURL = `https://5be96b4fb854d1001310915d.mockapi.io/api`;

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    function welcome(agent) {
      agent.add(
        `Hey! Willkommen bei cunio! Du kannst entweder Anfragen erstellen, oder dir bestehende Einträge ansehen. Kann ich dir helfen?`
      );
      agent.add(
        new Card({
          title: "Willkommen bei cunio!",
          text: "Dein persönlicher Mietassistent",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/cunio-7411b.appspot.com/o/Telephone_cunio%402x.png?alt=media&token=a75d62d8-cebf-4865-9dcd-51424cccca22"
        })
      );

      agent.add(new Suggestion("Erstell' eine Anfrage"));
      agent.add(new Suggestion("Zeig' mir eine Anfrage"));
    }

    function createReport(agent) {
      const type = agent.parameters["report_type"];
      const loc = agent.parameters["report_location"];
      const gotType = type.length > 0;
      const gotLoc = loc.length > 0;

      if (gotType && gotLoc) {
        return axios
          .post("/reports", { type: type, location: loc })
          .then(function(res) {
            const reportIdContext = {
              name: "reportidcontext",
              lifespan: 3,
              parameters: { reportId: res.data.id }
            };
            agent.context.set(reportIdContext);
            console.log("POSTREPORTRES: ", res);
            agent.add(
              `Okay, du hast also ein ${res.data.type} Problem im ${
                res.data.location
              }. Möchtest du noch eine Beschreibung zu deiner Anfrage hinzufügen?`
            );
            agent.add(new Suggestion("Ja"));
            agent.add(new Suggestion("Nein"));
          })
          .catch(function(err) {
            console.log("POSTREPORTERR: ", err);
            agent.add(
              "Ups, da ist etwas schiefgelaufen. Probiere es am besten gleich nochmal!"
            );
          });
      } else if (gotType && !gotLoc) {
        agent.add("Wo befindet sich dein Problem?");
      } else if (gotLoc && !gotType) {
        agent.add("Was genau ist dein Problem?");
      } else {
        agent.add("Was ist dein Problem und wo befindet es sich?");
      }
    }

    function createReportAddDesc(agent) {
      const reportIdContext = agent.context.get("reportidcontext");
      const reportId = reportIdContext.parameters.reportId;
      const desc = agent.query;
      console.log("report id: ", reportId);

      return axios
        .put(`/reports/${reportId}`, { desc: desc })
        .then(function(res) {
          console.log(res);
          agent.add(
            new Card({
              title: `Neue Anfrage: ${res.data.type} - ${res.data.location}`,
              text: `${res.data.desc}`
            })
          );
          agent.add(
            `Alles klar, ich erstelle direkt eine Anfrage daraus und informiere deine Ansprechpartner! Bis zum nächsten Mal!`
          );
        })
        .catch(function(err) {
          console.log("Put Report desc err: ", err);
          agent.add(
            `Ups, da ist etwas schiefgelaufen. Kannst du es bitte nocheinmal versuchen?`
          );
        });
    }

    function getLatestReports(agent) {
      return axios
        .get(`/reports?page=1&limit=1&sortBy=createdAt&order=desc`)
        .then(function(res) {
          console.log(res);
          let desc = "";
          res.data[0].desc.startsWith("desc")
            ? (desc = "keine Beschreibung")
            : (desc = res.data[0].desc);
          agent.add("Hier ist die letzte Anfrage:");
          agent.add(
            new Card({
              title: `Anfrage ${res.data[0].id}: ${res.data[0].type} - ${
                res.data[0].location
              }`,
              text: desc
            })
          );
        });
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("createReport", createReport);
    intentMap.set("createReportAddDesc", createReportAddDesc);
    intentMap.set("getLatestReports", getLatestReports);
    agent.handleRequest(intentMap);
  }
);
