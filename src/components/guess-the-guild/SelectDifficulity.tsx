import { ButtonGroup, Stack, Text } from "@chakra-ui/react"
import Button from "components/common/Button"

import { GDG_DIFFICULITY } from "./constants"

type Props = {
  value: string
  onChange: (String) => void
  small?: boolean
}

const OPTIONS = [
  {
    value: GDG_DIFFICULITY.EASY,
    label: "EZPZ",
    symbol: `👶`,
  },
  {
    value: GDG_DIFFICULITY.MEDIUM,
    label: "What do you mean, casual?",
    symbol: `🙂`,
  },
  {
    value: GDG_DIFFICULITY.HARD,
    label: "IDDQD",
    symbol: `💀`,
  },
]

const SelectDiffuculity = ({ value: selected, onChange, small }: Props) => {
  const Container = small ? ButtonGroup : Stack
  const continerProps = small ? { isAttached: true } : { w: "full", p: "4" }

  return (
    <>
      {small ? null : (
        <Text mb="2" align="center">
          How hard do you like it? <br />( be honest! )
        </Text>
      )}
      <Container {...continerProps}>
        {OPTIONS.map(({ value, label, symbol }) => (
          <Button
            size="sm"
            key={value}
            colorScheme={selected === value && "blue"}
            onClick={() => onChange(value)}
          >
            {`${small ? "" : label} ${symbol}`}
          </Button>
        ))}
      </Container>
    </>
  )
}

export default SelectDiffuculity
