export default function(babel) {
  const { types: t } = babel

  const slotVisitor = {
    JSXElement(path) {
      const { node, node: { openingElement, openingElement: { name, attributes: [as] } } } = path
      if (name.name !== 'Slot') return
      path.replaceWith(t.JSXExpressionContainer(t.identifier(`${this.paramName}.${as.value.value}`)))
    },
  }

  return {
    name: 'slot-fill', // not required
    visitor: {
      // Strip the import
      // @TODO refactor this to make `withHoles` an identity function
      ImportDeclaration(path) {
        if (path.node.source.value === 'slot-fill') {
          path.remove()
        }
      },
      CallExpression(path) {
        const { node: { callee, arguments: [comp] } } = path
        if (callee.name !== 'withHoles') return
        console.log(comp)
        if (t.isArrowFunctionExpression(comp)) {
          const paramName = comp.params[0].name
          // @TODO either make `withHoles` an identity function or strip it from the call expression and replace the path
          // with just the argument
          path.traverse(slotVisitor, { paramName })
        } else if (t.isClassExpression(comp)) {
          path.traverse(slotVisitor, { paramName: 'this.props' })
        }
      },
    },
  }
}
