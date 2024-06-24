const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
// Structure pour stocker la taxonomie
let taxonomy = {};
let currentLevelNodes = {};

// Fonction pour ajouter un nœud à la structure
function addNode(level, label) {
  const newNode = {};

  if (level === 0) {
    taxonomy[label] = newNode;
    currentLevelNodes[level] = taxonomy[label];
  } else {
    const parentLevel = level - 1;
    const parentNode = currentLevelNodes[parentLevel];

    if (parentNode) {
      // Si le label existe déjà, ajouter un suffixe pour le rendre unique
      let uniqueLabel = label;
      let counter = 1;

      while (parentNode[uniqueLabel]) {
        uniqueLabel = `${label}_${counter}`;
        counter++;
      }

      parentNode[uniqueLabel] = newNode;
      currentLevelNodes[level] = parentNode[uniqueLabel];
    }
  }
}

// Lire le fichier CSV
fs.createReadStream("./file.csv")
  .pipe(csv({ separator: ";" }))
  .on("data", (row) => {
    const level = parseInt(row.level);
    const label = row.label;

    // Ignorer la première ligne des en-têtes
    if (!isNaN(level)) {
      addNode(level, label);
    }
  })
  .on("end", () => {
    // log
  });

app.get("/", (req, res) => {
  res.send(taxonomy);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
