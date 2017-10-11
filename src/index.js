const defaultLabel = 'sitrep'

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

  function hasSitrepComments (comments, label = defaultLabel) {
    return comments.some(c => c.value.trim().indexOf(label) === 0)
  }

  function getSitrepCommentPrefix (comments, label = defaultLabel) {
    for (let i = 0; i < comments.length; i += 1) {
      const comment = comments[i].value.trim()
      if (comment.indexOf(label) === 0 && comment.length > label.length) {
        return comment.substr(label.length).trim()
      }
    }
    return undefined
  }

  function createLogStatement (thing) {
    return t.callExpression(
      logCallee,
      thing.name && thing.name.indexOf('returnValue') > -1
        ? [t.stringLiteral('Return Value:'), thing]
        : thing.name ? [t.stringLiteral(`${thing.name}: `), thing] : [thing]
    )
  }

  function getName (path) {
    if (path.parentPath.isClassProperty()) {
      if (
        path.parentPath.node.key &&
        t.isIdentifier(path.parentPath.node.key)
      ) {
        return path.parentPath.node.key.name
      }
    }

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

  function functionVisitor (functionPath, state, prefix) {
    let name = getName(functionPath)
    if (prefix) name = `(${prefix}) ${name}`
    functionPath
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

    functionPath.traverse({
      AssignmentExpression (path) {
        if (t.isPattern(path.node.left)) {
          return
        }
        path.insertAfter(
          t.expressionStatement(createLogStatement(path.node.left))
        )
      },
      ArrayPattern (arrPatternPath) {
        arrPatternPath.node.elements
          .slice()
          .reverse()
          .forEach(element => {
            let id = element
            if (t.isAssignmentPattern(element)) {
              id = element.left
            }
            arrPatternPath
              .getStatementParent()
              .insertAfter(
                t.expressionStatement(
                  t.callExpression(logCallee, [t.stringLiteral(id.name), id])
                )
              )
          })
      },
      ObjectPattern (objPatternPath) {
        objPatternPath.node.properties
          .slice()
          .reverse()
          .forEach(prop => {
            objPatternPath
              .getStatementParent()
              .insertAfter(
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
      },
      VariableDeclaration (variableDeclPath) {
        if (!variableDeclPath.parentPath.isBlockStatement()) {
          return
        }

        const decls = variableDeclPath.node.declarations
        decls.forEach(dec => {
          if (!dec.init) {
            return
          }

          if (t.isPattern(dec.id)) {
            return
          }

          variableDeclPath.insertAfter(
            t.expressionStatement(createLogStatement(dec.id))
          )
        })
      },
      ReturnStatement (returnPath) {
        const id = returnPath.scope.generateUidIdentifier('returnValue')
        returnPath.insertBefore(
          t.variableDeclaration('var', [
            t.variableDeclarator(id, returnPath.node.argument)
          ])
        )

        returnPath.insertBefore(
          t.expressionStatement(
            t.callExpression(createGroupCallee(true, state.opts.collapsed), [
              t.stringLiteral(name)
            ])
          )
        )
        didWriteGroupEnd = true
        returnPath.node.argument = id
      }
    })
    if (!didWriteGroupEnd) {
      functionPath
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
      Class (path, state) {
        path.traverse({
          ClassProperty (path) {
            const comments = getComments(path.node)
            if (hasSitrepComments(comments, state.opts.label)) {
              const prefix = getSitrepCommentPrefix(comments, state.opts.label)
              path.traverse({
                Function (path) {
                  functionVisitor(path, state, prefix)
                }
              })
            }
          }
        })
      },
      Function (path, state) {
        const comments = getComments(path.node)
        if (hasSitrepComments(comments, state.opts.label)) {
          const prefix = getSitrepCommentPrefix(comments, state.opts.label)
          if (path.isArrowFunctionExpression()) {
            path.arrowFunctionToShadowed()
          }
          functionVisitor(path, state, prefix)
        }
      },
      VariableDeclarator (path, state) {
        const comments = getComments(path.parentPath.node)
        if (
          hasSitrepComments(comments, state.opts.label)
        ) {
          const prefix = getSitrepCommentPrefix(comments, state.opts.label)
          if (t.isArrowFunctionExpression(path.node.init)) {
            path.get('init').arrowFunctionToShadowed()
          }
          if (t.isFunction(path.node.init)) {
            path.traverse({
              Function (path) {
                functionVisitor(path, state, prefix)
              }
            })
          }
        }
      }
    }
  }
}
