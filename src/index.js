import MyReact from "./MyReact";

const root = document.getElementById("root");

// function App(props) {
//   const [count, setCount] = MyReact.useState(0);
//
//   return MyReact.createElement(
//     "h1",
//     {
//       onClick: () => {
//         setCount((prev) => prev + 1);
//       },
//     },
//     MyReact.createElement("p", null, count),
//     "hi",
//     props.name,
//   );
// }
//
// const element = MyReact.createElement(App, { name: "Foo" });
// MyReact.render(element, root);

const renderUpdate = (value) => {
  const element = MyReact.createElement(
    "div",
    null,
    MyReact.createElement("input", {
      oninput: (e) => renderUpdate(e.target.value),
    }),
    MyReact.createElement("div", null, value),
  );
  MyReact.render(element, root);
};

renderUpdate("hello");
