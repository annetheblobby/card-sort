/* eslint-disable @typescript-eslint/no-explicit-any */
//for code input
const csvContent = ``;
figma.showUI(__html__, { width: 400, height: 500 });

// // Listen for messages from the UI
// figma.ui.onmessage = (msg) => {
//   if (msg.type === "generate-nested-list") {
//     console.log("generate-nested-list");
//     const nestedList = parseSections(figma.currentPage.selection);
//     figma.ui.postMessage({ type: "nested-list", data: nestedList });
//   }
// };

// Function to recursively parse sections and stickies
// function parseSections(nodes: any) {
//   console.log("here");
//   const list: any = [];
//   console.log(nodes);
//   nodes.forEach((node: any) => {
//     console.log(node);
//     if (node.type === "SECTION") {
//       // const sublist = [node.name];
//       // const children = parseSections(node.children, []);
//       // sublist.push(children);
//       // list.push(sublist);
//       list.push(node.name);
//       list.push(parseSections(node.children));
//     }
//     // else if (node.type === "STICKY") {
//     //   list.push(node.characters);
//     // }
//   });
//   console.log(list);
//   return list;
// }
// type FigJamNode = {
//   type: "SECTION" | "OVERVIEW" | "CHILDSECTION" | "CHILDSTICKYTEXT";
//   name: string;
//   children?: FigJamNode[];
// };
// const result: (string | string[][])[] = [];

// function parseFigJamDocument(node: any): (string | string[][])[] {
//   //['sectionName', [['overview']['childSectionName', [['childStickyText'], ['childStickyText']]]],

//   if (node.type === "SECTION") {
//     const sectionName = node.name;
//     result.push([sectionName]);
//     node.children.forEach((child: any) => {
//       if (child.type === "SECTION") {
//         const currList = result[result.length - 1];
//         currList.push(parseFigJamDocument(child));
//       }
//     });
//   }

//   return result;
// }
const result: any = [];
function parseSectionNames(node: any, depth: number): string[] {
  console.log("node", node);
  if (node.type === "SECTION") {
    if (depth === 0) {
      result.push(node.name);
      result.push([]);
    } else if (depth === 1) {
      result[1].push([node.name, [["QUERIES"], ["MUTATIONS"], ["OBJECTS"]]]);
    }
    if (node.children) {
      node.children.forEach((child: any) => {
        console.log("child", child.name);
        parseSectionNames(child, depth + 1);
      });
    }
  } else if (node.type === "STICKY") {
    //push to last list element
    let nodeName = node.name.split(" ")[0];
    const mainList = result[1];
    const currList = mainList[mainList.length - 1][1];
    console.log("currList", currList);

    if (node.name.toLowerCase().includes("queries")) {
      currList[0].push([nodeName]);
    } else if (node.name.toLowerCase().includes("mutations")) {
      currList[1].push([nodeName]);
    } else if (node.name.toLowerCase().includes("objects")) {
      currList[2].push([nodeName]);
    }
  } else {
    console.log("not a section or sticky");
  }
  return result;
}

// function flattenThirdDepth(arr: any[]): any[] {
//   return arr.map((item) => {
//     if (Array.isArray(item[1])) {
//       return [
//         item[0],
//         item[1].map((subItem) => {
//           if (Array.isArray(subItem[1])) {
//             return [subItem[0], ...subItem[1]];
//           }
//           return subItem;
//         }),
//       ];
//     }
//     return item;
//   });
// }

figma.ui.onmessage = async (msg: { type: string; text: string }) => {
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  const textInput = msg.text;
  if (msg.type === "generate-nested-list") {
    console.log("generate-nested-list");
    // const nestedList = parseSections(figma.currentPage.selection);
    const sectionNames = parseSectionNames(figma.currentPage.selection[0], 0);
    // const flattened = flattenThirdDepth(sectionNames);
    // console.log("final", flattened);
    figma.ui.postMessage({
      type: "nested-list",
      data: JSON.stringify(sectionNames),
    });
  }
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
  // figma.closePlugin();
};
