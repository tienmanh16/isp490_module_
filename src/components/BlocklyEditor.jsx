import { useEffect, useRef, useState } from "react";
import { Box, Button, Text, VStack, HStack, useToast } from "@chakra-ui/react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/blocks";
import { submitCodeForGrading } from "../backendApi";
import GradingResult from "./GradingResult";

const BlocklyEditor = ({ assignmentId = 1 }) => {
  const blocklyDiv = useRef();
  const [workspace, setWorkspace] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Khởi tạo Blockly workspace
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "🎨 Logic",
            colour: "210",
            contents: [
              { kind: "block", type: "controls_if" },
              { kind: "block", type: "logic_compare" },
              { kind: "block", type: "logic_operation" },
              { kind: "block", type: "logic_negate" },
              { kind: "block", type: "logic_boolean" },
            ],
          },
          {
            kind: "category",
            name: "🔁 Loops",
            colour: "120",
            contents: [
              { kind: "block", type: "controls_repeat_ext" },
              { kind: "block", type: "controls_whileUntil" },
              { kind: "block", type: "controls_for" },
              { kind: "block", type: "controls_forEach" },
            ],
          },
          {
            kind: "category",
            name: "🔢 Math",
            colour: "230",
            contents: [
              { kind: "block", type: "math_number" },
              { kind: "block", type: "math_arithmetic" },
              { kind: "block", type: "math_single" },
              { kind: "block", type: "math_trig" },
              { kind: "block", type: "math_constant" },
            ],
          },
          {
            kind: "category",
            name: "📝 Text",
            colour: "160",
            contents: [
              { kind: "block", type: "text" },
              { kind: "block", type: "text_print" },
              { kind: "block", type: "text_join" },
              { kind: "block", type: "text_length" },
            ],
          },
          {
            kind: "category",
            name: "📦 Variables",
            colour: "330",
            custom: "VARIABLE",
          },
          {
            kind: "category",
            name: "🔧 Functions",
            colour: "290",
            custom: "PROCEDURE",
          },
        ],
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
      },
    });

    setWorkspace(ws);

    // Force resize nhiều lần để đảm bảo Blockly nhận đúng size
    const forceResize = () => {
      if (blocklyDiv.current && ws) {
        Blockly.svgResize(ws);
      }
    };

    // Resize với nhiều delays khác nhau
    const timeouts = [0, 50, 100, 200, 300, 500, 800, 1000, 1500].map(delay =>
      setTimeout(forceResize, delay)
    );

    // Auto-resize khi window thay đổi
    const handleWindowResize = () => {
      forceResize();
    };
    window.addEventListener('resize', handleWindowResize);

    // Cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('resize', handleWindowResize);
      
      if (ws) {
        ws.dispose();
      }
    };
  }, []);

  // Theo dõi khi container thay đổi kích thước
  useEffect(() => {
    if (!blocklyDiv.current || !workspace) return;

    const resizeObserver = new ResizeObserver(() => {
      Blockly.svgResize(workspace);
    });

    resizeObserver.observe(blocklyDiv.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [workspace]);

  // Generate code từ blocks
  const handleGenerateCode = () => {
    if (!workspace) return;
    
    const code = javascriptGenerator.workspaceToCode(workspace);
    setGeneratedCode(code);
    setShowCode(true);
    
    toast({
      title: "✅ Code Generated!",
      description: "Check the code below",
      status: "success",
      duration: 2000,
    });
  };

  // Submit blocks để chấm điểm
  const handleSubmit = async () => {
    if (!workspace) return;

    const code = javascriptGenerator.workspaceToCode(workspace);
    
    console.log("🔍 Generated code from Blockly:", code);
    console.log("📝 Code length:", code.length);
    console.log("📊 Assignment ID:", assignmentId);
    
    if (!code || code.trim() === "") {
      toast({
        title: "Empty Blocks",
        description: "Please create some blocks before submitting.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setGradingResult(null);

    try {
      console.log("🚀 Submitting to backend...");
      
      // ✅ Gọi backend API KHÔNG THAY ĐỔI GÌ!
      const result = await submitCodeForGrading(
        assignmentId,
        code,
        "javascript" // Blockly generate JavaScript
      );

      console.log("✅ Backend response:", result);
      
      setGradingResult(result);

      const finalScore = typeof result.score === 'number' 
        ? result.score 
        : parseFloat(result.score) || 0;

      toast({
        title: "Submission Successful! 🎉",
        description: `Your score: ${finalScore.toFixed(1)}/100`,
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("❌ Submission error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      let errorDescription = "Unable to submit blocks. Please try again.";

      if (error.response) {
        errorDescription = error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        errorDescription = "Cannot connect to server. Please check your connection.";
      }

      toast({
        title: "Submission Failed",
        description: errorDescription,
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear workspace
  const handleClear = () => {
    if (workspace) {
      workspace.clear();
      setGeneratedCode("");
      setShowCode(false);
      setGradingResult(null);
      
      toast({
        title: "Workspace Cleared",
        status: "info",
        duration: 2000,
      });
    }
  };

  return (
    <VStack spacing={2} align="stretch" width="100%" height="100%">
      {/* Header & Buttons - Compact Layout */}
      <HStack 
        justify="space-between" 
        align="center" 
        flexShrink={0} 
        py={2} 
        px={3}
        bg="gray.800"
        borderRadius="md"
      >
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="cyan.300">
            🧩 Blockly Visual Programming
          </Text>
        </Box>
        
        <HStack spacing={3}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleGenerateCode}
            leftIcon={<span>🔍</span>}
          >
            View Code
          </Button>

          <Button
            size="sm"
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            leftIcon={<span>✅</span>}
          >
            Submit
          </Button>

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={handleClear}
            leftIcon={<span>🗑️</span>}
          >
            Clear
          </Button>
        </HStack>
      </HStack>

      {/* Blockly Workspace - MAXIMUM HEIGHT */}
      <Box
        ref={blocklyDiv}
        flex="1"
        minH="0"
        width="100%"
        border="2px solid"
        borderColor="gray.600"
        borderRadius="md"
        bg="white"
      />

      {/* Generated Code Display - Collapsible */}
      {showCode && generatedCode && (
        <Box
          p={3}
          bg="gray.900"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.700"
          maxH="200px"
          overflowY="auto"
          flexShrink={0}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold" color="cyan.400" fontSize="sm">
              📄 Generated JavaScript Code:
            </Text>
            <Button
              size="xs"
              onClick={() => setShowCode(false)}
            >
              Hide
            </Button>
          </HStack>
          <Box
            as="pre"
            fontSize="xs"
            fontFamily="monospace"
            color="green.300"
            overflowX="auto"
            whiteSpace="pre-wrap"
          >
            {generatedCode}
          </Box>
        </Box>
      )}

      {/* Grading Result - Collapsible */}
      {gradingResult && (
        <Box flexShrink={0} maxH="250px" overflowY="auto">
          <GradingResult result={gradingResult} />
        </Box>
      )}
    </VStack>
  );
};

export default BlocklyEditor;
