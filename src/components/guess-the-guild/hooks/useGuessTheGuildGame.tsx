import { useState } from "react"
import getRandomInt from "utils/getRandomInt"
import { GDG_DIFFICULITY, GDG_MODE, GDG_STATUS, OPTIONS_COUNT } from "../constants"
import useLocalStoragePersistState from "./useLocalStoragePersistState"

export const BACH_SIZE_BY_DIFFICULITY = {
  [GDG_DIFFICULITY.EASY]: 100,
  [GDG_DIFFICULITY.MEDIUM]: 500,
  [GDG_DIFFICULITY.HARD]: 1000,
}

export const POINTS_BY_GAME_MODE = {
  [GDG_MODE.GUESS]: 1,
  [GDG_MODE.PAIRS]: 2,
}

const hasImage = ({ imageUrl }) => imageUrl?.length
const randomGameMode = () =>
  Object.values(GDG_MODE)[getRandomInt(Object.keys(GDG_MODE).length)]
const shuffle = (arr = []) => arr.sort(() => 0.5 - Math.random())
const randomGuilds = (guildsPool) => shuffle(guildsPool).slice(0, OPTIONS_COUNT)

const useGuessTheGuildGame = ({ guildsInitial = [] }) => {
  const [difficulity, setDifficulity] = useLocalStoragePersistState(
    GDG_DIFFICULITY.EASY,
    "guildxzy.guess-the-guild.difficulity"
  )
  const [record, setRecord] = useLocalStoragePersistState(
    0,
    "guildxzy.guess-the-guild.record"
  )

  const [status, setStatus] = useState(GDG_STATUS.INIT)
  const [gameMode, setGameMode] = useState(randomGameMode())
  const [score, setScore] = useState(0)

  //const batchSize = BACH_SIZE_BY_DIFFICULITY[difficulity]
  const guildsQueryResult = guildsInitial

  const guildsPool = guildsQueryResult.flat().filter(hasImage)

  const [options, setOptions] = useState(randomGuilds(guildsPool))
  const [questions, setQuestions] = useState(
    gameMode === GDG_MODE.GUESS
      ? options[getRandomInt(options.length - 1)]
      : shuffle([...options])
  )

  const onGuess = () => {
    const newScore = score + POINTS_BY_GAME_MODE[gameMode]
    setScore(newScore)

    if (newScore > record) {
      setRecord(newScore)
    }

    setOptions(randomGuilds(guildsPool))
    setQuestions(
      gameMode === GDG_MODE.GUESS
        ? options[getRandomInt(options.length)]
        : shuffle([...options])
    )

    setGameMode(randomGameMode())
  }

  const startGame = () => {
    setStatus(GDG_STATUS.QUESTION)
  }

  return {
    round: {
      questions,
      options,
      submit: onGuess,
    },
    gameMode,
    status,
    score,
    record,
    difficulity,
    onDifficulityChange: setDifficulity,
    startGame,
  }
}

export default useGuessTheGuildGame
