import Didact from "./MyReact";

const root = document.getElementById("root");

function App(props) {
  const [count, setCount] = Didact.useState(0);

  return Didact.createElement(
    "h1",
    {
      onClick: () => {
        setCount(100);
      },
    },
    Didact.createElement("p", null, count),
    "hi",
    props.name,
  );
}

const element = Didact.createElement(App, { name: "Foo" });
Didact.render(element, root);
