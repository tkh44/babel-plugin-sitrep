module.exports = function (babel) {
  const { types: t } = babel
  const logCallee = t.memberExpression(
    t.identifier('console'),
    t.identifier('log'),
    false
  )

  const createGroupCallee = (end, collapsed = true) =>
    t.memberExpression(
      t.identifier('console'),
      t.identifier(`group${end ? 'End' : collapsed ? 'Collapsed' : ''}`),
      false
    )

  function getComments (node) {
    return (node && node.leadingComments) || []
  }

  function hasSitrepComments (comments, label = 'sitrep') {
    return comments.some(c => c.value.trim() === label)
  }

  function createLogStatement (thing) {
    return t.callExpression(
      logCallee,
      thing.name && thing.name.includes('returnValue')
        ? [t.stringLiteral('Return Value:'), thing]
        : thing.name ? [t.stringLiteral(`${thing.name}: `), thing] : [thing]
    )
  }

  function getName (path) {
    if (path.node.id && path.node.id.name) {
      return path.node.id.name
    }

    if (path.node.key && t.isIdentifier(path.node.key)) {
      return path.node.key.name
    }

    const variableParent = path.findParent(p => p.isVariableDeclarator())
    if (variableParent && t.isIdentifier(variableParent.node.id)) {
      return variableParent.node.id.name
    }

    return `function: ${path.getSource().split('\n')[0]}`
  }

  function functionVisitor (path, state) {
    if (path.isArrowFunctionExpression()) {
      return
    }

    let name = getName(path)
    path
      .get('body')
      .unshiftContainer(
        'body',
        t.expressionStatement(
          t.callExpression(createGroupCallee(false, state.opts.collapsed), [
            t.stringLiteral(name)
          ])
        )
      )
    let didWriteGroupEnd = false
    path.traverse({
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

        path.insertBefore(
          t.expressionStatement(
            t.callExpression(createGroupCallee(true, state.opts.collapsed), [
              t.stringLiteral(name)
            ])
          )
        )
        didWriteGroupEnd = true
        path.node.argument = id
      }
    })
    if (!didWriteGroupEnd) {
      path
        .get('body')
        .pushContainer(
          'body',
          t.expressionStatement(
            t.callExpression(createGroupCallee(true, state.opts.collapsed), [
              t.stringLiteral(name)
            ])
          )
        )
    }
  }

  return {
    name: 'babel-plugin-sitrep',
    visitor: {
      Function (path, state) {
        if (hasSitrepComments(getComments(path.node), state.opts.label)) {
          if (path.isArrowFunctionExpression()) {
            path.arrowFunctionToShadowed()
          }
          functionVisitor(path, state)
        }
      },
      VariableDeclarator (path, state) {
        if (
          hasSitrepComments(getComments(path.parentPath.node), state.opts.label)
        ) {
          if (t.isArrowFunctionExpression(path.node.init)) {
            path.get('init').arrowFunctionToShadowed()
          }
          if (t.isFunction(path.node.init)) {
            path.traverse({
              Function (path) {
                functionVisitor(path, state)
              }
            })
          }
        }
      }
    }
  }
}
