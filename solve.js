"use strict"

/**
 * There are 5 possible trees:
 *        .
 *       / \
 *      /   \
 *     .     .
 *    / \   / \
 *   #   # #   #
 */
const CONFIGS = [
    [0, "+*-/", [1, "+*-/", [2, "+*-/", 3]]],
    [0, "+*-/", [
        [1, "+*-/", 2], "+*-/", 3
    ]],
    [
        [
            [0, "+*-/", 1], "+*-/", 2
        ], "+*-/", 3
    ],
    [
        [0, "+*-/", [1, "+*-/", 2]], "+*-/", 3
    ],
    [
        [0, "+*-/", 1], "+*-/", [2, "+*-/", 3]
    ]
]

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"

function compute(values, config) {
    if (typeof config === 'number') {
        const value = values[config]
        return [
            [value, `${value}`]
        ]
    }

    const [leftConfig, operations, rightConfig] = config
    const leftResults = compute(values, leftConfig)
    const rightResults = compute(values, rightConfig)

    const results = []
    for (const leftResult of leftResults) {
        const [leftValue, leftText] = leftResult
        for (const rightResult of rightResults) {
            const [rightValue, rightText] = rightResult
            for (const ope of operations) {
                switch (ope) {
                    case '+':
                        results.push([
                            leftValue + rightValue, `(${leftText}+${rightText})`
                        ])
                        break;
                    case '-':
                        results.push([
                            leftValue - rightValue, `(${leftText}-${rightText})`
                        ])
                        break;
                    case '*':
                        results.push([
                            leftValue * rightValue, `(${leftText}*${rightText})`
                        ])
                        break;
                    case '/':
                        if (rightValue !== 0) {
                            results.push([
                                leftValue / rightValue, `(${leftText}/${rightText})`
                            ])
                        }
                        break;
                }
            }
        }
    }

    return results
}

/**
 * @param  {[number, number, number, number]} values
 */
function getAllArrangements(values) {
    const result = []
    for (let idx0 = 0; idx0 < 4; idx0++) {
        for (let idx1 = 0; idx1 < 4; idx1++) {
            if (idx1 === idx0) continue
            for (let idx2 = 0; idx2 < 4; idx2++) {
                if (idx2 === idx0) continue
                if (idx2 === idx1) continue
                for (let idx3 = 0; idx3 < 4; idx3++) {
                    if (idx3 === idx0) continue
                    if (idx3 === idx1) continue
                    if (idx3 === idx2) continue
                    result.push([
                        values[idx0],
                        values[idx1],
                        values[idx2],
                        values[idx3]
                    ])
                }
            }
        }
    }

    const already = new Set()
    return result.filter(arrangement => {
        const key = JSON.stringify(arrangement)
        if (already.has(key)) return false
        already.add(key)
        return true
    })
}

function printResult(result) {
    const [value, text] = result
    console.log(text, "=", value)
}

function sortByValue(r1, r2) {
    const [v1] = r1
    const [v2] = r2

    return v1 - v2
}

function sortByValueReverse(r1, r2) {
    const [v1] = r1
    const [v2] = r2

    return v2 - v1
}

function solve(inputValues) {
    const allResults = []
    const allPossibleValues = getAllArrangements(inputValues)
    for (const values of allPossibleValues) {
        for (const config of CONFIGS) {
            const results = compute(values, config)
            allResults.push(...results)
        }
    }
    //allResults.forEach(printResult)

    const solutions = allResults.filter(config => config[0] === 24)
    return solutions
}

function getHigherMultipleOf3LowerThan(value) {
    const remainder = value % 3
    return value - remainder
}

function chunk(value, position) {
    const leftShift = 1 - position
    if (leftShift >= 0) return (value << leftShift) & 63
    const rightShift = -leftShift
    return (value >> rightShift) & 63
}

function encode(arr) {
    let result = ""
    while (arr.length > 0) {
        const hexaWord = arr.splice(0, 6)
        // Every input (i0, i1, ..., i5) is coded with 5 bits.
        const [i0, i1, i2, i3, i4, i5] = hexaWord
        // We want to transform them into 5 outputs of 6 bits each.
        const o0 = chunk(i0, +0) | chunk(i1, +5)
        const o1 = chunk(i1, -1) | chunk(i2, +4)
        const o2 = chunk(i2, -2) | chunk(i3, +3)
        const o3 = chunk(i3, -3) | chunk(i4, +2)
        const o4 = chunk(i4, -4) | chunk(i5, +1)
        result += [o0, o1, o2, o3, o4]
            .map(output => BASE64_ALPHABET.charAt(output))
            .join('')
    }
    return result
}

function createLevelsModule() {
    const puzzles = []

    console.log("// This file has been automatically generated on")
    console.log("//", (new Date()).toString())
    console.log("")
    console.log("import LevelsDecoder from './levels-decoder'")
    console.log("")

    const COUNTER_MAX_VALUE = 40920
    let counter = 0
    let lastProgressValue = 0

    for (let v0 = 1; v0 < 32; v0++) {
        if (v0 === 24) continue
        for (let v1 = v0; v1 < 32; v1++) {
            if (v1 === 24) continue
            for (let v2 = v1; v2 < 32; v2++) {
                if (v2 === 24) continue
                for (let v3 = v2; v3 < 32; v3++) {
                    if (v3 === 24) continue
                    counter++
                    const progressValue = Math.floor(100 * counter / COUNTER_MAX_VALUE)
                    if (progressValue !== lastProgressValue) {
                        lastProgressValue = progressValue
                        console.error(`Progress ${progressValue}%`)
                    }
                    const values = [v0, v1, v2, v3]
                    const solutions = solve(values)
                    if (solutions.length === 0) continue
                    puzzles.push([solutions.length, values])
                }
            }
        }
    }

    puzzles.sort(sortByValueReverse)
    const levels = []
    const count = puzzles.length
    let nbLevels = 100

    while (nbLevels > 1) {
        const nbPuzzlesInThisLevel = Math.floor(0.5 + puzzles.length / nbLevels)
        const subArray = puzzles.splice(0, getHigherMultipleOf3LowerThan(nbPuzzlesInThisLevel))
        levels.push(encode([].concat(...subArray.map(pair => pair[1]))))
        nbLevels--
    }
    levels.push(encode([].concat(...puzzles.map(pair => pair[1]))))

    console.log("export default LevelsDecoder.decode(", JSON.stringify(levels, null, '    '), ")")
}

/*
const toto = encode([5, 16, 18, 27, 28, 13])
console.log(toto)

function pad(text, size) {
  while (text.length < size) {
    text = `0${text}`
  }
  return text
}

function p5(n) {
  return pad((n >>> 0).toString(2), 5)
}

function p6(n) {
  return pad((n >>> 0).toString(2), 6)
}

var input = [5, 16, 18, 27, 28, 13]
console.log(input.map(p5).join(''))

console.log(
    Array.from(toto)
        .map(letter => BASE64_ALPHABET.indexOf(letter))
        .map(p6)
        .join('')
)

const v21 = p5(21)
console.log(v21)
for (let shift = -5 ; shift < 6 ; shift++) {
    console.log(p6(chunk(v21, shift)), shift)
}
*/
createLevelsModule()
console.error("Done!")
