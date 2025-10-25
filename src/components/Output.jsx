import { useState } from "react";
import { Box, Button, Text, useToast, VStack, HStack } from "@chakra-ui/react";
import { executeCode } from "../api";
import { submitCodeForGrading } from "../backendApi";
import GradingResult from "./GradingResult";

const Output = ({ editorRef, language, exerciseId = 1 }) => {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const sourceCode = editorRef.current.getValue();
    
    if (!sourceCode || !sourceCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before submitting.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setGradingResult(null);

    try {
      // Gửi code sang Backend để chấm điểm
      const result = await submitCodeForGrading(exerciseId, sourceCode, language);
      
      console.log("Grading result received:", result); // Debug log
      setGradingResult(result);
      
      // Convert BigDecimal từ backend sang number
      const finalScore = typeof result.score === 'number' ? result.score : parseFloat(result.score) || 0;
      
      toast({
        title: "Submission Successful! 🎉",
        description: `Your score: ${finalScore.toFixed(1)}/100`,
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Submission error:", error);
      
      // Xử lý các loại lỗi khác nhau
      let errorTitle = "Submission Failed";
      let errorDescription = "Unable to submit code. Please try again.";
      
      if (error.response) {
        // Backend trả về lỗi
        errorDescription = error.response.data?.message || error.response.statusText;
        
        if (error.response.status === 401) {
          errorTitle = "Authentication Required";
          errorDescription = "Please login to submit your code.";
        } else if (error.response.status === 429) {
          errorTitle = "Too Many Submissions";
          errorDescription = "You've reached the submission limit. Please try again later.";
        }
      } else if (error.request) {
        // Request được gửi nhưng không có response
        errorDescription = "Cannot connect to server. Please check your connection.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box w="50%">
      <VStack align="stretch" spacing={4}>
        {/* Header Section */}
        <Box>
          <Text mb={2} fontSize="lg" fontWeight="semibold">
            Output & Results
          </Text>
          
          {/* Action Buttons */}
          <HStack spacing={3}>
            {/* Run Code Button - Test nhanh */}
            <Button
              variant="outline"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Running..."
              onClick={runCode}
              flex={1}
            >
              ▶️ Run Code
            </Button>

            {/* Submit Button - Chấm điểm chính thức */}
            <Button
              variant="solid"
              colorScheme="green"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              onClick={handleSubmit}
              flex={1}
            >
              ✅ Submit
            </Button>
          </HStack>
        </Box>

        {/* Output Box - Hiển thị kết quả Run Code */}
        <Box
          height="35vh"
          p={3}
          color={isError ? "red.400" : ""}
          border="1px solid"
          borderRadius={4}
          borderColor={isError ? "red.500" : "#333"}
          bg="gray.900"
          overflowY="auto"
          fontSize="sm"
          fontFamily="monospace"
        >
          {output
            ? output.map((line, i) => <Text key={i}>{line}</Text>)
            : 'Click "Run Code" to test your code here'}
        </Box>

        {/* Grading Result - Hiển thị kết quả chấm điểm */}
        {gradingResult && <GradingResult result={gradingResult} />}
      </VStack>
    </Box>
  );
};
export default Output;
