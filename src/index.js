import MyReact from "./MyReact";

const root = document.getElementById("root");

function App(props) {
  const [count, setCount] = MyReact.useState(0);

  return MyReact.createElement(
    "h1",
    {
      onClick: () => {
        setCount((prev) => prev + 1);
      },
    },
    MyReact.createElement("p", null, count),
    "hi",
    props.name,
  );
}

const element = MyReact.createElement(App, { name: "Foo" });
MyReact.render(element, root);
