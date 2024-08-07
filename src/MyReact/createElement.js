function createElement(type, props, ...children) {
  console.log(type);
  console.log(props);
  console.log(children);
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        console.log(child, typeof child);
        if (typeof child === "object") {
          return child;
        } else {
          return createTextElement(child);
        }
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export { createElement };
