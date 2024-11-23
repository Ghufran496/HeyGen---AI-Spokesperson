"use client";

import React, { useState, useRef, useEffect } from "react";
import StreamingAvatar from "@heygen/streaming-avatar";
import {
  AvatarQuality,
  TaskMode,
  TaskType,
  StreamingEvents,
} from "@heygen/streaming-avatar";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const TakeASurvey = () => {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [isSurveyInProgress, setIsSurveyInProgress] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState(""); // Text input for chat
  const [isListening, setIsListening] = useState(false); // Listening state
  const [isIntro, setIsIntro] = useState(true); // State to track intro vs survey
  const questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ];

  const avatarRef = useRef<StreamingAvatar | null>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);

  const fetchAccessToken = async () => {
    const response = await fetch("/api/get-access-token", { method: "POST" });
    if (response.ok) {
      return await response.text();
    }
    throw new Error("Failed to fetch access token");
  };

  const startAvatarSession = async () => {
    setIsLoadingSession(true);
    const accessToken = await fetchAccessToken();

    avatarRef.current = new StreamingAvatar({
      token: accessToken,
    });

    avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
      setIsAvatarSpeaking(true);
    });

    avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      setIsAvatarSpeaking(false);
    });

    avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
      if (mediaStream.current) {
        mediaStream.current.srcObject = event.detail;
        mediaStream.current.play();
      }
    });

    await avatarRef.current.createStartAvatar({
      quality: AvatarQuality.High,
      avatarName: "Wayne_20240711", // Replace with your HeyGen Avatar ID
      disableIdleTimeout: true,
    });

    setIsLoadingSession(false);
  };

  const speakMessage = async (message: any) => {
    if (!avatarRef.current) return;
    await avatarRef.current.speak({
      text: message,
      taskType: TaskType.REPEAT,
      taskMode: TaskMode.SYNC,
    });
  };

  const startSurvey = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      const response = await fetch("/api/savesurvey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (response.ok) {
        setIsSurveyInProgress(true);
        await startAvatarSession();
        await speakMessage(
          `Hello ${userName}! I am here to guide you through the Personal Health Questionnaire. Are you ready to begin? Please answer in Yes or No.`
        );
      } else {
        console.error("Failed to initialize survey");
      }
    } catch (error) {
      console.error("Error starting survey:", error);
    }
  };

  const saveResponse = async (response: string) => {
    if (isIntro) {
      if (
        response.toLowerCase().includes("yes") ||
        response.toLowerCase().includes("yes i am ready")
      ) {
        setIsIntro(false);
        setIsSurveyInProgress(true);
        speakMessage(questions[currentQuestionIndex]);
      } else {
        speakMessage("Alright, let me know when you're ready to start.");
        setIsSurveyInProgress(false);
      }
      return;
    }

    try {
      const result = await fetch("/api/savesurvey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          responses: [
            { question: questions[currentQuestionIndex], answer: response },
          ],
        }),
      });

      if (result.ok) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          speakMessage(questions[currentQuestionIndex + 1]);
        } else {
          await speakMessage(
            `Thank you, ${userName}, for completing the survey! Your responses have been recorded.`
          );
          setIsSurveyInProgress(false);
        }
      } else {
        console.error("Failed to save response");
      }
    } catch (error) {
      console.error("Error saving response:", error);
    }
  };

  const handleTextAnswer = async () => {
    setIsListening(false);
    if (chatInput.trim() === "") {
      await speakMessage(
        "I didn't catch that. Could you please type your answer?"
      );
      return;
    }
    await saveResponse(chatInput);
    setChatInput("");
  };

  const handleVoiceAnswer = async () => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      alert(
        "Your browser does not support speech recognition. Please type your answer."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = async (event: any) => {
      const voiceAnswer = event.results[0][0].transcript;
      setIsListening(false);

      if (voiceAnswer.trim() !== "") {
        await saveResponse(voiceAnswer);
      } else {
        await speakMessage(
          "I didn't catch that. Could you repeat your answer?"
        );
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      alert("Could not process your voice input. Please try again.");
    };
  };

  useEffect(() => {
    return () => {
      avatarRef.current?.stopAvatar();
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          marginBottom: "20px",
          color: "#FFD700",
        }}
      >
        Take a Survey
      </h1>
      {!isSurveyInProgress ? (
        <div style={{ textAlign: "center" }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              fontSize: "1rem",
              borderRadius: "5px",
              border: "1px solid #444",
              backgroundColor: "#222",
              color: "#fff",
              marginBottom: "20px",
            }}
          />
          <br />
          <button
            onClick={startSurvey}
            disabled={isLoadingSession}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "5px",
              backgroundColor: "#FFD700",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
              marginTop: "10px",
            }}
          >
            {isLoadingSession ? "Loading..." : "Start Survey"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.5rem", marginBottom: "20px" }}>
            Survey in progress...
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <video
              ref={mediaStream}
              autoPlay
              playsInline
              style={{
                width: "80%",
                height: "auto",
                border: "2px solid #FFD700",
                borderRadius: "10px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "80%",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  flex: "1",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #444",
                  backgroundColor: "#222",
                  color: "#fff",
                }}
              />
              <button
                onClick={handleTextAnswer}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#FFD700",
                  color: "#000",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
              <button
                onClick={handleVoiceAnswer}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isListening ? "#999" : "#FFD700",
                  color: "#000",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: isListening ? "not-allowed" : "pointer",
                }}
              >
                {isListening ? "Listening..." : "Speak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeASurvey;

// "use client";

// import SurveyAvatar from "@/components/SurveyAvatar";

// export default function Suvery() {

//   return (
//     <div className="w-screen h-screen flex flex-col">
//       <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
//         <div className="w-full">
//           <SurveyAvatar />
//         </div>
//       </div>
//     </div>
//   );
// }