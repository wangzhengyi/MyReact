let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

/**
 * 工作循环函数，处理渲染任务
 */
function workLoop(deadline) {
  let shouldYield = false;
  // 当有下一个工作单元且不需要让出控制权时，继续工作
  while (nextUnitOfWork && !shouldYield) {
    // 执行当前工作单元，并获取下一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 检查是否还有剩余时间，如果少于1毫秒，则应该让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果没有下一个工作单元且存在进行中的根节点，提交整个树
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // 继续请求下一次空闲回调
  requestIdleCallback(workLoop);
}
// 开始工作循环
requestIdleCallback(workLoop);

/**
 * 渲染函数，开始整个渲染过程
 */
function render(element, container) {
  // 设置进行中的根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  deletions = [];
  nextUnitOfWork = wipRoot;
}

/**
 * 执行工作单元
 */
function performUnitOfWork(fiber) {
  // 判断是否为函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }

  return nextFiber;
}

/**
 * 更新函数组件
 */
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

/**
 * 更新宿主组件（原生DOM元素）
 */
function updateHostComponent(fiber) {
  // 如果fiber没有DOM节点，创建一个
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 将DOM节点添加到父节点
  if (fiber.parent) {
    let domParent = fiber.parent;
    // 查找最近的有DOM节点的祖先
    while (!domParent.dom) {
      domParent = domParent.parent;
    }
    domParent.dom.appendChild(fiber.dom);
  }

  // 协调子元素
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

/**
 * 协调子元素，比较新旧节点并创建新的fiber节点
 */
function reconcileChildren(fiber, elements) {
  let index = 0;
  // 获取旧fiber的第一个子节点
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling = null;

  // 遍历新的子元素或旧的fiber
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    // 比较旧fiber和新元素的类型
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 如果类型相同，更新节点
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // 如果有新元素但类型不同，创建新节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // 如果有旧fiber但类型不同，标记为删除
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 建立fiber树的结构
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

/**
 * 创建DOM节点
 */
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

/**
 * 更新DOM节点的属性和事件
 */
function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  const isGone = (prev, next) => {
    return (key) => {
      return !(key in next);
    };
  };

  // 移除旧的或已更改的事件监听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 移除旧的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // 设置新的或已更改的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // 添加新的事件监听器
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

/**
 * 提交整个fiber树的变更
 */
function commitRoot() {
  // 先处理需要删除的节点
  deletions.forEach((deletion) => {
    commitWork(deletion);
  });
  // 提交工作单元
  commitWork(wipRoot.child);
  // 更新当前根节点
  currentRoot = wipRoot;
  wipRoot = null;
}

/**
 * 提交单个工作单元的变更
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 查找父DOM节点
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  // 根据effectTag执行相应的DOM操作
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 执行节点删除
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

let wipFiber = null;
let hookIndex = null;
function useState(initial) {
  // 获取旧的hook
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // 创建新的hook
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  // 执行之前队列中的actions
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (typeof action === "function") {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  });

  const setState = (action) => {
    hook.queue.push(action);
    // 设置新的工作单元，触发重新渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // 将hook添加到fiber
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

export { render, useState };
