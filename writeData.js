const faker = require("faker");
const fs = require("fs");

const colors = [
  "fec5bb",
  "fcd5ce",
  "fae1dd",
  "f8edeb",
  "e8e8e4",
  "d8e2dc",
  "ece4db",
  "ffe5d9",
  "ffd7ba",
  "fec89a",
];

function randomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function buildTree() {
  return {
    type: "tree",
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    color: randomColor(),
    children: [],
  };
}

function buildLeaf() {
  return {
    type: "leaf",
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    isTraining: faker.datatype.boolean(),
    secondaryInformation: faker.company.bsAdjective(),
  };
}

const data = buildTree();
for (let i = 0; i < 2; i++) {
  data.children.push(buildTree());
}
for (const child of data.children) {
  for (let i = 0; i < 2; i++) {
    child.children.push(buildTree());
  }

  for (const grandchild of child.children) {
    for (let i = 0; i < 2; i++) {
      grandchild.children.push(buildLeaf());
    }
  }
}

fs.writeFileSync("data4L2N.json", JSON.stringify(data));
