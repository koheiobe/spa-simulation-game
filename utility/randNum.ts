export const fiftyParcent = (): boolean => {
  return Math.floor(Math.random() * 10) % 2 === 0
}

export const sixtyParcent = (): boolean => {
  return Math.floor(Math.random() * 10) <= 6
}
