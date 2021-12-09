const faker = require("faker");
const fs = require("fs");

function buildNode() {
  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    children: [],
  };
}

const data = buildNode();
for (let i = 0; i < 5; i++) {
  data.children.push(buildNode());
}
for (const child of data.children) {
  for (let i = 0; i < 10; i++) {
    child.children.push(buildNode());
  }

  for (const grandchild of child.children) {
    for (let i = 0; i < 100; i++) {
      grandchild.children.push(buildNode());
    }
  }
}

fs.writeFileSync("data4L100N.json", JSON.stringify(data));
