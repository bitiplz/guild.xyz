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
  const [questions, setQuestions] = useState(shuffle([...options]))
  const [answers, setAnswers] = useState(Array(OPTIONS_COUNT).fill(null))

  const submitDisabled =
    gameMode === GDG_MODE.GUESS
      ? answers?.[0] === null
      : answers.findIndex((a) => a === null) !== -1

  const isGuessCorrect = () =>
    gameMode === GDG_MODE.GUESS
      ? answers[0]?.id === questions[0].id
      : answers.every((a, i) => a?.id === questions[i].id)

  const updateScoreAndRecord = () => {
    const newScore = score + POINTS_BY_GAME_MODE[gameMode]
    setScore(newScore)

    if (newScore > record) {
      setRecord(newScore)
    }
  }

  const resetScore = () => setScore(0)

  const nextRound = () => {
    setStatus(GDG_STATUS.QUESTION)
    const newGuilds = randomGuilds(guildsPool)
    setOptions(newGuilds)
    setQuestions(shuffle([...newGuilds]))
    setAnswers(Array(OPTIONS_COUNT).fill(null))
    setGameMode(randomGameMode())
  }

  const onGuess = () => {
    if (isGuessCorrect()) {
      updateScoreAndRecord()
    } else {
      resetScore()
    }

    setStatus(GDG_STATUS.RESULT)
  }

  return {
    round: {
      questions,
      options,
      answers,
      setAnswers,
      submitDisabled,
      submit: onGuess,
    },
    gameMode,
    status,
    score,
    record,
    difficulity,
    onDifficulityChange: setDifficulity,
    nextRound,
  }
}

export default useGuessTheGuildGame
