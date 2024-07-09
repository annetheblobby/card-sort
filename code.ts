//for code input
const csvContent = ``;
figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = async (msg: { type: string; text: string }) => {
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  const textInput = msg.text;
  if (msg.type === "create-shapes") {
    //   const numberOfShapes = msg.count;
    const lines = textInput.split("\n");
    const objects = lines.map((line) => {
      const [category1, type, resource, url] = line.split(",");
      return { category1, type, resource, url };
    });
    console.log(objects);
    const numberOfShapes = lines.length;
    const nodes: SceneNode[] = [];
    for (let i = 0; i < numberOfShapes; i++) {
      const sticky = figma.createSticky();
      sticky.x = i * (sticky.width + 200);
      //if mutation make orange
      if (objects[i].type === "Mutations") {
        //orange color
        sticky.fills = [
          { type: "SOLID", color: { r: 1, g: 196 / 255, b: 100 / 255 } },
        ];
      } else if (objects[i].type === "Queries") {
        //if query make purple
        sticky.fills = [
          { type: "SOLID", color: { r: 217 / 255, g: 184 / 255, b: 1 } },
        ];
      } else if (objects[i].type === "Objects") {
        //if object make yellow
        sticky.fills = [
          { type: "SOLID", color: { r: 1, g: 217 / 255, b: 102 / 255 } },
        ];
      }
      if (objects[i].resource) {
        sticky.text.characters =
          objects[i].resource +
          "\n \n" +
          "Type: " +
          objects[i].type +
          "\n" +
          "Category: " +
          objects[i].category1;
      } else {
        // for flat lists
        sticky.text.characters = objects[i].category1;
      }
      if (objects[i].url) {
        sticky.text.hyperlink = { type: "URL", value: objects[i].url };
      }
      figma.currentPage.appendChild(sticky);
      nodes.push(sticky);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  figma.closePlugin();
};
