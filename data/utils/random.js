export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
