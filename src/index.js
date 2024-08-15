import MyReact from "./MyReact";

const root = document.getElementById("root");

// // 测试函数式组件
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
//     "hi ",
//     props.name,
//   );
// }
//
// const element = MyReact.createElement(App, { name: "WangZhengyi" });
// MyReact.render(element, root);

// // 测试fiber算法
// const renderUpdate = (value) => {
//   const element = MyReact.createElement(
//     "div",
//     null,
//     MyReact.createElement("input", {
//       oninput: (e) => renderUpdate(e.target.value),
//     }),
//     MyReact.createElement("div", null, value),
//   );
//   MyReact.render(element, root);
// };
//
// renderUpdate("hello");

// 测试拍平children
const todos = [1, 2, 3, 4, 5, 6];
const element = MyReact.createElement(
  "ul",
  null,
  todos.map((todo) => MyReact.createElement("li", null, todo)),
);
MyReact.render(element, root);
