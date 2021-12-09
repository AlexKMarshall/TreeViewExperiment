const faker = require("faker");
const fs = require("fs");

function buildNode() {
  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    children: [],
  };
}

function buildTree() {
  return {
    type: "tree",
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    color: faker.internet.color(),
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
for (let i = 0; i < 5; i++) {
  data.children.push(buildTree());
}
for (const child of data.children) {
  for (let i = 0; i < 10; i++) {
    child.children.push(buildTree());
  }

  for (const grandchild of child.children) {
    for (let i = 0; i < 100; i++) {
      grandchild.children.push(buildLeaf());
    }
  }
}

fs.writeFileSync("data4L100N.json", JSON.stringify(data));
