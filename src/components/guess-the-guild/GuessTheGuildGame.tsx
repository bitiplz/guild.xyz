import { Stack, Text } from "@chakra-ui/react"
import Button from "components/common/Button"
import Card from "components/common/Card"
import { GuildBase } from "types"

import GuessModeForm from "./GuessModeForm"
import PairsModeForm from "./PairsModeForm"
import SelectDiffuculity from "./SelectDifficulity"
import StatusDisplay from "./StatusDisplay"

import { GDG_MODE, GDG_STATUS } from "./constants"
import useGuessTheGuildGame from "./hooks/useGuessTheGuildGame"

type Props = {
  guilds: GuildBase[]
}

const GuessTheGuildGame = ({ guilds }: Props) => {
  const {
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
    onDifficulityChange,
    nextRound,
  } = useGuessTheGuildGame({ guildsInitial: guilds })

  const isInGuessMode = gameMode === GDG_MODE.GUESS
  const isInInitStatus = gameMode === GDG_STATUS.INIT
  const isInQuestioneStatus = status === GDG_STATUS.QUESTION
  const isInResultStatus = status === GDG_STATUS.RESULT

  const GameDisplayComp = isInGuessMode ? GuessModeForm : PairsModeForm

  const actionButtonProps = {
    onClick: isInQuestioneStatus ? onGuess : nextRound,
    label: isInQuestioneStatus ? "I'm sure" : "Next",
    disabled: isInQuestioneStatus && submitDisabled,
  }

  return (
    <Stack w="full" alignItems="center">
      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text fontSize="26">Guess the Guild</Text>
        <Text fontSize="14">the most awesomest minigame</Text>
      </Card>

      {isInInitStatus ? (
        <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
          <SelectDiffuculity value={difficulity} onChange={onDifficulityChange} />
          <Button w="full" colorScheme="green" onClick={nextRound}>
            Let's gooo!
          </Button>
        </Card>
      ) : (
        <>
          <StatusDisplay
            score={score}
            record={record}
            difficulity={difficulity}
            onDifficulityChange={onDifficulityChange}
          />
          <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
            <GameDisplayComp
              showResults={isInResultStatus}
              questions={questions}
              options={options}
              answers={answers}
              setAnswers={setAnswers}
            />
            <Button
              w="full"
              h="8"
              colorScheme="green"
              onClick={actionButtonProps.onClick}
              isDisabled={actionButtonProps.disabled}
            >
              {actionButtonProps.label}
            </Button>
          </Card>
        </>
      )}
    </Stack>
  )
}

export default GuessTheGuildGame
