/**
 * createElement 函数用于创建虚拟 DOM 元素
 */
function createElement(type, props, ...children) {
  // 返回一个对象，表示虚拟 DOM 元素
  console.log("wzy", "createElement-type", type);
  return {
    type, // 元素的类型（如 'div', 'span' 等，或者自定义组件）
    props: {
      ...props, // 展开传入的 props
      children: children.map((child) => {
        if (typeof child === "object") {
          // 如果子元素已经是对象（可能是另一个虚拟 DOM 元素）
          return child;
        } else {
          // 如果子元素是原始类型（如字符串、数字）,将其转换为文本元素
          return createTextElement(child);
        }
      }),
    },
  };
}

/**
 * 用于创建文本节点的虚拟 DOM 表示
 */
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT", // 指定特殊的类型表示这是一个文本节点
    props: {
      nodeValue: text, //文本内容
      children: [], //文本节点没有子节点，所以是空数组
    },
  };
}

export { createElement };
