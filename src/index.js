module.exports = function(babel) {
  const { types: t } = babel

  function getComments(node) {
    return (node && node.leadingComments) || []
  }

  function hasSitcomComment(comments) {
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
      thing.name === '__$returnValue'
        ? [t.stringLiteral('Return Value:'), thing]
        : thing.name ? [t.stringLiteral(thing.name), thing] : [thing]
    )
  }

  return {
    name: 'babel-plugin-sitrep', // not required
    visitor: {
      Function(path) {
        if (hasSitcomComment(getComments(path.node))) {
          path
            .get('body')
            .unshiftContainer(
              'body',
              t.expressionStatement(
                createLogStatement(
                  t.stringLiteral(`function: ${path.node.id.name}`)
                )
              )
            )

          path.traverse({
            VariableDeclaration(path) {
              path.node.declarations.forEach(dec => {
                path.insertAfter(
                  t.expressionStatement(createLogStatement(dec.id))
                )
              })
            },
            ReturnStatement(path) {
              const id = t.identifier('__$returnValue')
              path.insertBefore(
                t.variableDeclaration('var', [
                  t.variableDeclarator(id, path.node.argument)
                ])
              )
              path.node.argument = id
            }
          })
        }
      }
    }
  }
}
