import {
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  List,
  ListItem,
} from "@chakra-ui/react";

const GradingResult = ({ result }) => {
  if (!result) return null;

  const {
    score,
    aiFeedback,
    suggestions,
  } = result;

  const finalScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return "green";
    if (scoreValue >= 60) return "yellow";
    return "red";
  };

  const scoreColor = getScoreColor(finalScore);

  return (
    <Box
      mt={6}
      p={6}
      bg="gray.800"
      borderRadius="lg"
      borderWidth="2px"
      borderColor={`${scoreColor}.500`}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Grading Result
          </Text>
          <HStack>
            <Text fontSize="3xl" fontWeight="bold" color={`${scoreColor}.400`}>
              {finalScore.toFixed(1)}
            </Text>
            <Text fontSize="xl" color="gray.400">
              / 100
            </Text>
          </HStack>
        </HStack>

        <Divider />

        {aiFeedback && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              AI Feedback
            </Text>
            <Box
              p={3}
              bg="gray.700"
              borderRadius="md"
              fontSize="sm"
              whiteSpace="pre-wrap"
            >
              {aiFeedback}
            </Box>
          </Box>
        )}

        {suggestions && suggestions.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Suggestions for Improvement
            </Text>
            <List spacing={2}>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  p={2}
                  bg="blue.900"
                  borderRadius="md"
                  fontSize="sm"
                >
                  <HStack align="start">
                    <Text color="blue.300" fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text>{suggestion}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default GradingResult;
