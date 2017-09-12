module.exports = function(babel) {
  const { types: t } = babel

  function getComments(node) {
    return (node && node.leadingComments) || []
  }

  function hasSitrepComments(comments) {
    return comments.some(c => c.value.trim() === 'sitrep')
  }

  function createLogStatement(thing) {
    const callee = t.memberExpression(
      t.identifier('console'),
      t.identifier('log'),
      false
    )
    return t.callExpression(
      callee,
      thing.name && thing.name.includes('returnValue')
        ? [t.stringLiteral('Return Value:'), thing]
        : thing.name ? [t.stringLiteral(thing.name), thing] : [thing]
    )
  }

  const dive = {
    AssignmentExpression(path) {
      path.insertAfter(
        t.expressionStatement(createLogStatement(path.node.left))
      )
    },
    VariableDeclaration(path) {
      const decls = path.node.declarations
      decls.forEach(dec => {
        path.insertAfter(t.expressionStatement(createLogStatement(dec.id)))
      })
    },
    ReturnStatement(path) {
      const id = path.scope.generateUidIdentifier('returnValue')
      path.insertBefore(
        t.variableDeclaration('var', [
          t.variableDeclarator(id, path.node.argument)
        ])
      )
      path.node.argument = id
    }
  }

  return {
    name: 'babel-plugin-sitrep', // not required
    visitor: {
      BlockStatement(path) {
        let p = path.findParent(p => hasSitrepComments(getComments(p.node)))
        if (!p) {
          return
        }

        if (hasSitrepComments(getComments(p.node))) {
          path.traverse(dive)
        }
      },
      ArrowFunctionExpression(path) {
        let p = path.findParent(p => hasSitrepComments(getComments(p.node)))
        if (!p) {
          return
        }

        if (hasSitrepComments(getComments(p.node))) {
          path.arrowFunctionToShadowed()
        }
      }
    }
  }
}
