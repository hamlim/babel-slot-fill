export default function(babel) {
  const { types: t } = babel
  const FILL = 'fill'
  const SLOT = 'slot'
  const HOC = 'withSlots'
  const IMPORT = 'slot-fill'

  const slotVisitor = {
    JSXElement(path) {
      const { node, node: { openingElement, openingElement: { name, attributes: [as] } } } = path
      if (name.name !== SLOT) return
      path.replaceWith(t.JSXExpressionContainer(t.identifier(`${this.paramName}.${as.value.value}`)))
    },
  }

  return {
    name: 'slot-fill', // not required
    visitor: {
      // Strip the import
      ImportDeclaration(path) {
        if (path.node.source.value === IMPORT) {
          path.remove()
        }
      },
      CallExpression(path) {
        const { node: { callee, arguments: [comp] } } = path
        if (callee.name !== HOC) return
        // if its an arrow function
        // this covers stateless functional components
        if (t.isArrowFunctionExpression(comp)) {
          const paramName = comp.params[0].name
          path.traverse(slotVisitor, { paramName })
          path.replaceWith(
          	t.ArrowFunctionExpression(
              comp.params,
              comp.body
            )
          )
        } else if (t.isClassExpression(comp)) {
          // otherwise handle class based components
          path.traverse(slotVisitor, { paramName: 'this.props' })
          path.replaceWith(
          	t.ClassExpression(
              t.Identifier(comp.id.name),
              comp.superClass,
              comp.body,
              []
            )
          )
        }
      },
      JSXElement(path) {
        const { node, node: { children } } = path
        const hasfillChildren = children.find(c => t.isJSXElement(c) && c.openingElement.name.name === FILL)
        if (!hasfillChildren) return
        const allFillChildren = children.filter(c => t.isJSXElement(c) && c.openingElement.name.name === FILL)
        allFillChildren.forEach(fill => {
          path.get('openingElement').pushContainer(
            'attributes',
            t.JSXAttribute(
              t.JSXIdentifier(fill.openingElement.attributes[0].value.value),
              t.JSXExpressionContainer(
                t.ArrayExpression(
                  fill.children.map(child => {
                    if (t.isJSXText(child)) {
                      return t.StringLiteral(child.value)
                    }
                    if (t.isJSXElement(child)) {
                      return child
                    }
                    if (t.isJSXExpressionContainer(child)) {
                      // {variableName}
                      if (t.isIdentifier(child.expression)) {
                        return t.Identifier(child.expression.name)
                        // {() => ({})}
                      } else if (t.isArrowFunctionExpression(child.expression)) {
                        return t.ArrowFunctionExpression(child.expression.params, child.expression.body)
                        // {'string'}
                      } else if (t.isStringLiteral(child.expression)) {
                        return t.StringLiteral(child.expression.value)
                        //{['hi', 'heyo']}
                      } else if (t.isArrayExpression(child.expression)) {
                        return t.ArrayExpression(
                          child.expression.elements.map(el => {
                            //{'string'}
                            if (t.isStringLiteral(el)) return t.StringLiteral(el.value)
                            // {() => ({})}
                            if (t.isArrowFunctionExpression(el)) return t.ArrowFunctionExpression(el.params, el.body)
                            // {variableName}
                            if (t.isIdentifier(el)) return t.Identifier(el.name)
                            // <El />
                            if (t.isJSXElement(el)) return el
                          }),
                        )
                      }
                    }
                  }),
                ),
              ),
            ),
          )
        })
        path.get('children').forEach(childPath => {
          if (t.isJSXElement(childPath.node) && childPath.get('openingElement').node.name.name === FILL) {
            childPath.remove();
          }
        })
      },
    },
  }
}
