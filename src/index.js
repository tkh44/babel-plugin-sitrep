module.exports = function (babel) {
  const { types: t } = babel
  const logCallee = t.memberExpression(
    t.identifier('console'),
    t.identifier('log'),
    false
  )

  function getComments (node) {
    return (node && node.leadingComments) || []
  }

  function hasSitrepComments (comments) {
    return comments.some(c => c.value.trim() === 'sitrep')
  }

  function createLogStatement (thing) {
    return t.callExpression(
      logCallee,
      thing.name && thing.name.includes('returnValue')
        ? [t.stringLiteral('Return Value:'), thing]
        : thing.name ? [t.stringLiteral(thing.name), thing] : [thing]
    )
  }

  const dive = {
    AssignmentExpression (path) {
      path.insertAfter(
        t.expressionStatement(createLogStatement(path.node.left))
      )
    },
    VariableDeclaration (path) {
      const decls = path.node.declarations
      decls.forEach(dec => {
        if (t.isPattern(dec.id)) {
          dec.id.properties
            .slice()
            .reverse()
            .forEach(prop => {
              path.insertAfter(
                t.expressionStatement(
                  t.callExpression(logCallee, [
                    t.isIdentifier(prop.value)
                      ? t.stringLiteral(prop.value.name)
                      : t.stringLiteral(prop.key.name),
                    t.isIdentifier(prop.value) ? prop.value : prop.key
                  ])
                )
              )
            })
          return
        }

        path.insertAfter(t.expressionStatement(createLogStatement(dec.id)))
      })
    },
    ReturnStatement (path) {
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
    name: 'babel-plugin-sitrep',
    visitor: {
      Function (path) {
        if (hasSitrepComments(getComments(path.node))) {
          path.traverse({
            BlockStatement (blockStatementPath) {
              blockStatementPath.traverse(dive)
            }
          })
        }
      },
      VariableDeclarator (path) {
        if (hasSitrepComments(getComments(path.parentPath.node))) {
          if (t.isArrowFunctionExpression(path.node.init)) {
            path.get('init').arrowFunctionToShadowed()
          }
          if (t.isFunction(path.node.init)) {
            path.traverse(dive)
          }
        }
      }
    }
  }
}
