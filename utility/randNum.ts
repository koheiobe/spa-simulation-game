export const fiftyParcent = (): boolean => {
  return Math.floor(Math.random() * 10) % 2 === 0
}

export const sixtyParcent = (): boolean => {
  return Math.floor(Math.random() * 10) <= 6
}

export const getRandomVariable = (ary: Array<any>) => {
  const randNum = Math.floor(Math.random() * ary.length)
  const randNum2 = randNum === ary.length ? randNum - 1 : randNum
  return ary[randNum2]
}
