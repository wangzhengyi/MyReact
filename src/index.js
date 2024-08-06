import React from "react";
import ReactDOM from "react-dom/client";
import Didact from "./MyReact";

// const h1 = React.createElement("h1", { title: "a" }, "123");
//
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(h1, root);

const root = document.getElementById("root");

const de = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b"),
);

Didact.render(de, root);

console.log(de);
