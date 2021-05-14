// based on https://github.com/discord/eslint-traverse/blob/master/index.js
// modification: use evk.KEYS instead of context.getSourceCode().visitorKeys, which doesn't appear to work when testing
const evk = require("eslint-visitor-keys");

"use strict"

const SKIP = Symbol("skip")
const STOP = Symbol("stop")

function traverse(node, visitor) {
    let allVisitorKeys = evk.KEYS
    let queue = []

    queue.push({
        node,
        parent: null,
        parentKey: null,
        parentPath: null
    })

    while (queue.length) {
        let currentPath = queue.shift()

        let result = visitor(currentPath)
        if (result === STOP) break
        if (result === SKIP) continue

        let visitorKeys = allVisitorKeys[currentPath.node.type]
        if (!visitorKeys) continue

        for (let visitorKey of visitorKeys) {
            let child = currentPath.node[visitorKey]

            if (!child) {
                continue
            } else if (Array.isArray(child)) {
                for (let item of child) {
                    queue.push({
                        node: item,
                        parent: currentPath.node,
                        parentKey: visitorKey,
                        parentPath: currentPath,
                    })
                }
            } else {
                queue.push({
                    node: child,
                    parent: currentPath.node,
                    parentKey: visitorKey,
                    parentPath: currentPath,
                })
            }
        }
    }
}

module.exports = traverse
module.exports.SKIP = SKIP
module.exports.STOP = STOP

